// Cortex · Modo Flow (Fase 1 sobre datos semilla).
// Máquina de estados: inicio → cápsula → reflexión → listo. Anti-adicción (§11):
// una cápsula por apertura, "Otra"/"Listo" igual de prominentes, meta diaria como
// identidad. Datos desde semilla local; el día que Supabase reviva, se cambia la fuente.

import "react-native-gesture-handler";
import React, { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { useFonts, Fraunces_400Regular, Fraunces_500Medium, Fraunces_400Regular_Italic } from "@expo-google-fonts/fraunces";
import { Newsreader_400Regular } from "@expo-google-fonts/newsreader";
import { Syne_600SemiBold, Syne_700Bold } from "@expo-google-fonts/syne";
import { HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold } from "@expo-google-fonts/hanken-grotesk";
import { SpaceMono_400Regular } from "@expo-google-fonts/space-mono";
import { DMSerifDisplay_400Regular, DMSerifDisplay_400Regular_Italic } from "@expo-google-fonts/dm-serif-display";
import { EBGaramond_400Regular, EBGaramond_600SemiBold, EBGaramond_400Regular_Italic } from "@expo-google-fonts/eb-garamond";
import { Anton_400Regular } from "@expo-google-fonts/anton";

import { Capsule, ExperimentState, InteractionAction, ReviewGrade } from "./src/types";
import { schedule, firstSchedule } from "./src/flow/sm2";
import { Theme, themeFor, THEMES } from "./src/theme";
import { loadFeed, FeedSource } from "./src/data/source";
import { syncInteraction, syncSaved, syncNote } from "./src/lib/sync";
import { pickCapsule, freshLeft } from "./src/flow/serving";
import { loadState, saveState, resetState, emptyState, todayStr, daysSinceStart } from "./src/lib/storage";
import CapsuleView from "./src/flow/CapsuleView";
import GraphView from "./src/flow/GraphView";
import DepthView from "./src/flow/DepthView";

const DAILY_GOAL = 5;
type Screen = "home" | "capsule" | "reflect" | "done" | "data" | "graph" | "depth";

export default function App() {
  const [loaded] = useFonts({
    Fraunces_400Regular, Fraunces_500Medium, Fraunces_400Regular_Italic,
    Newsreader_400Regular, Syne_600SemiBold, Syne_700Bold,
    HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold,
    SpaceMono_400Regular,
    DMSerifDisplay_400Regular, DMSerifDisplay_400Regular_Italic,
    EBGaramond_400Regular, EBGaramond_600SemiBold, EBGaramond_400Regular_Italic,
    Anton_400Regular,
  });

  const [state, setState] = useState<ExperimentState | null>(null);
  const [view, setView] = useState<Screen>("home");
  const [current, setCurrent] = useState<Capsule | null>(null);
  const [reflectText, setReflectText] = useState("");
  const [feed, setFeed] = useState<Capsule[] | null>(null);
  const [source, setSource] = useState<FeedSource>("seed");
  const sessionSeen = useRef(new Set<string>());
  const lastQueue = useRef<string | null>(null);

  useEffect(() => {
    loadState().then(setState);
    loadFeed().then((r) => { setFeed(r.capsules); setSource(r.source); });
  }, []);

  if (!loaded || !state || !feed) {
    return <View style={{ flex: 1, backgroundColor: THEMES.neutral.paper }} />;
  }

  const persist = (next: ExperimentState) => { setState(next); saveState(next); };
  const log = (s: ExperimentState, action: InteractionAction, capsuleId: string | null): ExperimentState => ({
    ...s, events: [...s.events, { action, capsuleId, ts: Date.now() }],
  });

  const open = () => {
    const cap = pickCapsule(feed, state, sessionSeen.current, lastQueue.current);
    sessionSeen.current.add(cap.id);
    lastQueue.current = cap.queue.title;
    setCurrent(cap);
    setReflectText("");
    persist(log(state, "served", cap.id));
    syncInteraction("served", cap.id); // → BD (si la cápsula viene de Supabase)
    setView("capsule");
  };

  const complete = () => {
    if (!current) return;
    const today = todayStr();
    let next = log(state, "completed", current.id);
    next = { ...next, byDay: { ...next.byDay, [today]: (next.byDay[today] ?? 0) + 1 }, seen: { ...next.seen, [current.id]: true } };
    // programar el repaso espaciado de lo aprendido (no de los propios repasos) — §7
    if (current.format !== "recall" && !next.reviews[current.id]) {
      next = { ...next, reviews: { ...next.reviews, [current.id]: firstSchedule(Date.now()) } };
    }
    persist(next);
    syncInteraction("completed", current.id);
    setView("reflect");
  };

  // completar un repaso con autocalificación (SM-2): reprograma el próximo repaso
  const completeRecall = (grade: ReviewGrade) => {
    if (!current) return;
    const today = todayStr();
    const key = current.reviewKey ?? current.id;
    let next = log(state, "completed", current.id);
    next = {
      ...next,
      byDay: { ...next.byDay, [today]: (next.byDay[today] ?? 0) + 1 },
      seen: { ...next.seen, [current.id]: true },
      reviews: { ...next.reviews, [key]: schedule(next.reviews[key], grade, Date.now()) },
    };
    persist(next);
    syncInteraction("completed", current.id, { responseText: `review:${grade}` });
    setView("reflect");
  };

  const saveReflection = (s: ExperimentState): ExperimentState => {
    const txt = reflectText.trim();
    if (!txt || !current) return s;
    syncNote(current.atom_id, txt); // reflexión → nodo del grafo (user_notes)
    syncInteraction("reflected", current.id, { responseText: txt }); // telemetría con la respuesta
    return log(
      { ...s, notes: [...s.notes, { capsuleId: current.id, prompt: current.reflection_prompt, text: txt, day: todayStr() }] },
      "reflected", current.id,
    );
  };

  const toggleSave = () => {
    if (!current) return;
    const has = state.saved.includes(current.id);
    const saved = has ? state.saved.filter((x) => x !== current.id) : [...state.saved, current.id];
    persist(has ? { ...state, saved } : log({ ...state, saved }, "saved", current.id));
    syncSaved(current.atom_id, !has); // guarda/quita el ATOMO en saved_atoms
    if (!has) syncInteraction("saved", current.id);
  };

  const resetExperiment = async () => {
    await resetState();
    setState(emptyState());
    setView("home");
  };

  const capsuleTheme = current ? themeFor(current.queue.theme) : THEMES.neutral;
  const done = state.byDay[todayStr()] ?? 0;
  const fresh = freshLeft(feed, state, sessionSeen.current); // cuántas NUEVAS quedan (§2/§3)

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: (view === "capsule" || view === "reflect" ? capsuleTheme : THEMES.neutral).paper }}>
      <StatusBar barStyle={(view === "capsule" || view === "reflect") && capsuleTheme.isDark ? "light-content" : "dark-content"} />
      {view === "home" && <Home theme={THEMES.neutral} done={done} day={daysSinceStart(state) + 1} fresh={fresh} onOpen={open} onData={() => setView("data")} onGraph={() => setView("graph")} onDepth={() => setView("depth")} />}
      {view === "capsule" && current && (
        <Safe>
          <CapsuleView
            capsule={current}
            theme={capsuleTheme}
            isSaved={state.saved.includes(current.id)}
            onToggleSave={toggleSave}
            onComplete={complete}
            onReview={completeRecall}
            onClose={() => { persist(log(state, "skipped", current.id)); syncInteraction("skipped", current.id); setView("home"); }}
          />
        </Safe>
      )}
      {view === "reflect" && current && (
        <Reflect
          theme={capsuleTheme}
          prompt={current.reflection_prompt}
          value={reflectText}
          onChange={setReflectText}
          onAnother={() => { persist(saveReflection(state)); open(); }}
          onDone={() => { persist(saveReflection(state)); setView("done"); }}
        />
      )}
      {view === "done" && <Done theme={THEMES.neutral} done={done} goal={DAILY_GOAL} onBack={() => setView("home")} />}
      {view === "data" && <Data theme={THEMES.neutral} state={state} goal={DAILY_GOAL} source={source} feedCount={feed.length} onBack={() => setView("home")} onReset={resetExperiment} />}
      {view === "graph" && <GraphView theme={THEMES.neutral} onClose={() => setView("home")} />}
      {view === "depth" && <DepthView theme={THEMES.neutral} userModel={state.userModel} onSaveUserModel={(um) => persist({ ...state, userModel: um })} onClose={() => setView("home")} />}
    </GestureHandlerRootView>
  );
}

// envoltorio con padding superior seguro (status bar)
const Safe = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flex: 1, paddingTop: 30 }}>{children}</View>
);

function Btn({ label, onPress, theme, variant }: { label: string; onPress: () => void; theme: Theme; variant: "primary" | "ghost" }) {
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        primary ? { backgroundColor: theme.ink } : { borderWidth: 1.5, borderColor: theme.line },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={{ fontFamily: theme.uiSemi, fontSize: 16, color: primary ? theme.paper : theme.ink }}>{label}</Text>
    </Pressable>
  );
}

function Home({ theme, done, day, fresh, onOpen, onData, onGraph, onDepth }: { theme: Theme; done: number; day: number; fresh: number; onOpen: () => void; onData: () => void; onGraph: () => void; onDepth: () => void }) {
  const pct = Math.min(done / DAILY_GOAL, 1);
  const hr = new Date().getHours();
  const greet = hr < 6 ? "De madrugada" : hr < 13 ? "Buenos días" : hr < 21 ? "Buenas tardes" : "Esta noche";
  return (
    <View style={[s.screen, { justifyContent: "space-between" }]}>
      <View style={s.rowBetween}>
        <Text style={{ fontFamily: theme.display, fontSize: 21, color: theme.ink }}>
          Cortex<Text style={{ color: theme.accent }}>.</Text>
        </Text>
        <Text style={{ fontFamily: theme.ui, fontSize: 12.5, color: theme.inkSoft, textAlign: "right" }}>
          día <Text style={{ fontFamily: theme.uiSemi, color: theme.ink }}>{day}</Text> de tu{"\n"}experimento
        </Text>
      </View>

      <View>
        <Text style={{ fontFamily: theme.ui, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: theme.inkFaint, marginBottom: 16 }}>
          {done >= DAILY_GOAL ? "Ya has cumplido hoy" : `${greet} · un hueco de dos minutos`}
        </Text>
        <Text style={{ fontFamily: theme.display, fontSize: 46, lineHeight: 49, color: theme.ink, letterSpacing: -0.8 }}>
          No hagas <Text style={{ fontFamily: theme.displayItalic, color: theme.accent }}>scroll</Text>.{"\n"}Aprende algo.
        </Text>
        <Text style={{ fontFamily: theme.read, fontSize: 18, lineHeight: 27, color: theme.inkSoft, marginTop: 20 }}>
          Una cápsula. No sabes de qué materia vendrá. Cuando termines, decides tú si quieres otra.
        </Text>
        {/* progreso del día (identidad, no racha) */}
        <View style={{ marginTop: 28 }}>
          <Text style={{ fontFamily: theme.display, fontSize: 17, color: theme.ink }}>
            {done} / {DAILY_GOAL} <Text style={{ fontFamily: theme.ui, fontSize: 13, color: theme.inkSoft }}>cápsulas hoy</Text>
          </Text>
          <View style={{ height: 5, borderRadius: 3, backgroundColor: theme.line, marginTop: 10, overflow: "hidden" }}>
            <View style={{ height: "100%", width: `${pct * 100}%`, backgroundColor: theme.accent, borderRadius: 3 }} />
          </View>
          {/* señal de frescura (§2/§3): lo visto no se repite disfrazado de nuevo */}
          <Text style={{ fontFamily: theme.ui, fontSize: 12.5, color: fresh === 0 ? theme.accent : theme.inkFaint, marginTop: 12, lineHeight: 18 }}>
            {fresh === 0
              ? "Has visto todo lo nuevo por ahora. Lo que venga será repaso — para traer material nuevo, entra en tu mente."
              : fresh <= 4
              ? `Te quedan ${fresh} cápsulas nuevas. Cuando se acaben, añade una materia en tu mente.`
              : `${fresh} cápsulas nuevas te esperan.`}
          </Text>
        </View>
      </View>

      <View>
        <Btn label="Abrir una cápsula  →" onPress={onOpen} theme={theme} variant="primary" />
        <Text style={{ fontFamily: theme.ui, fontSize: 12.5, color: theme.inkFaint, textAlign: "center", marginTop: 14 }}>
          Sin reproducción automática. Sin scroll infinito. Tú decides cuándo parar.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", columnGap: 18, rowGap: 8, marginTop: 16 }}>
          <Pressable onPress={onDepth} hitSlop={8}>
            <Text style={{ fontFamily: theme.ui, fontSize: 12, color: theme.inkFaint }}>tu mente  →</Text>
          </Pressable>
          <Pressable onPress={onGraph} hitSlop={8}>
            <Text style={{ fontFamily: theme.ui, fontSize: 12, color: theme.inkFaint }}>tu grafo  →</Text>
          </Pressable>
          <Pressable onPress={onData} hitSlop={8}>
            <Text style={{ fontFamily: theme.ui, fontSize: 12, color: theme.inkFaint }}>tu experimento  →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Reflect({ theme, prompt, value, onChange, onAnother, onDone }: {
  theme: Theme; prompt: string; value: string; onChange: (t: string) => void; onAnother: () => void; onDone: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={[s.screen, { justifyContent: "center", flexGrow: 1 }]} keyboardShouldPersistTaps="handled">
      <Text style={{ fontFamily: theme.kicker, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: theme.inkFaint, marginBottom: 18 }}>
        {theme.kickerPrefix}Antes de seguir
      </Text>
      <Text style={{ fontFamily: theme.display, fontSize: 30, lineHeight: 36, color: theme.ink, letterSpacing: -0.4 }}>{prompt}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline
        placeholder="Escribe lo que se te ocurra. Tan rápido como un WhatsApp. (Opcional)"
        placeholderTextColor={theme.inkFaint}
        style={{ marginTop: 22, minHeight: 96, backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.line, borderRadius: 18, padding: 16, fontFamily: theme.read, fontSize: 17, color: theme.ink, textAlignVertical: "top" }}
      />
      <Text style={{ fontFamily: theme.ui, fontSize: 12, color: theme.inkFaint, marginTop: 10 }}>
        Lo que escribes se guarda solo en este dispositivo.
      </Text>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 26 }}>
        <View style={{ flex: 1 }}><Btn label="Listo por hoy" onPress={onDone} theme={theme} variant="ghost" /></View>
        <View style={{ flex: 1 }}><Btn label="Otra  →" onPress={onAnother} theme={theme} variant="primary" /></View>
      </View>
    </ScrollView>
  );
}

function Done({ theme, done, goal, onBack }: { theme: Theme; done: number; goal: number; onBack: () => void }) {
  const full = done >= goal;
  return (
    <View style={[s.screen, { justifyContent: "center" }]}>
      <Text style={{ fontFamily: theme.display, fontSize: 56, color: theme.accent, marginBottom: 24 }}>✦</Text>
      <Text style={{ fontFamily: theme.display, fontSize: 42, lineHeight: 46, color: theme.ink, letterSpacing: -0.8 }}>
        {full ? "Has cerrado el día completo." : "Listo por hoy."}
      </Text>
      <Text style={{ fontFamily: theme.read, fontSize: 18, lineHeight: 27, color: theme.inkSoft, marginTop: 20 }}>
        {full
          ? `${done} cápsulas. Eres alguien que en los ratos muertos aprende. Vuelve cuando quieras, sin prisa.`
          : `${done} ${done === 1 ? "cápsula" : "cápsulas"} hoy. No hay racha que mantener ni culpa que cargar. Vuelve en el próximo hueco.`}
      </Text>
      <View style={{ marginTop: 34 }}><Btn label="Volver al inicio" onPress={onBack} theme={theme} variant="ghost" /></View>
    </View>
  );
}

function Data({ theme, state, goal, source, feedCount, onBack, onReset }: { theme: Theme; state: ExperimentState; goal: number; source: FeedSource; feedCount: number; onBack: () => void; onReset: () => void }) {
  const completed = state.events.filter((e) => e.action === "completed").length;
  const daysActive = Object.values(state.byDay).filter((v) => v > 0).length;
  const skipped = state.events.filter((e) => e.action === "skipped").length;
  const stats = [
    { n: completed, l: "cápsulas completadas" },
    { n: daysActive, l: "días que la abriste" },
    { n: state.saved.length, l: "ideas guardadas" },
    { n: skipped, l: "cerradas sin terminar" },
  ];
  const days = [] as { key: string; label: string; hit: boolean; some: boolean }[];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const c = state.byDay[key] ?? 0;
    days.push({ key, label: ["D", "L", "M", "X", "J", "V", "S"][d.getDay()], hit: c >= goal, some: c > 0 });
  }
  const sectionTitle = { fontFamily: theme.ui, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" as const, color: theme.inkFaint, marginBottom: 12, marginTop: 26 };
  return (
    <ScrollView contentContainerStyle={[s.screen, { flexGrow: 1 }]}>
      <Text style={{ fontFamily: theme.display, fontSize: 30, color: theme.ink, letterSpacing: -0.4 }}>Tu experimento</Text>
      <Text style={{ fontFamily: theme.ui, fontSize: 13, lineHeight: 19, color: theme.inkSoft, marginTop: 6 }}>
        El criterio (§15): a los 14 días, ¿abres Cortex en vez de TikTok más de la mitad de las veces? Estos son tus datos en crudo.
      </Text>
      {/* de dónde salen las cápsulas: BD (Supabase) o seed embebido (offline) */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginTop: 14, alignSelf: "flex-start", backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.line, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 13 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: source === "supabase" ? "#3fb950" : source === "cache" ? "#d6a44c" : theme.inkFaint }} />
        <Text style={{ fontFamily: theme.ui, fontSize: 12, color: theme.inkSoft }}>
          {source === "supabase"
            ? `Supabase local · ${feedCount} cápsulas`
            : source === "cache"
            ? `caché offline · ${feedCount} cápsulas`
            : `seed embebido · ${feedCount} cápsulas`}
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
        {stats.map((st, i) => (
          <View key={i} style={{ width: "47%", flexGrow: 1, backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.line, borderRadius: 16, padding: 16 }}>
            <Text style={{ fontFamily: theme.display, fontSize: 30, color: theme.ink }}>{st.n}</Text>
            <Text style={{ fontFamily: theme.ui, fontSize: 12, color: theme.inkSoft, marginTop: 6 }}>{st.l}</Text>
          </View>
        ))}
      </View>

      <Text style={sectionTitle}>Días que cumpliste la meta</Text>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {days.map((d) => (
          <View key={d.key} style={{ flex: 1, aspectRatio: 1, borderRadius: 8, borderWidth: 1.5, alignItems: "center", justifyContent: "center", backgroundColor: d.hit ? theme.accent : theme.surface, borderColor: d.hit ? theme.accent : theme.line, opacity: d.some && !d.hit ? 0.7 : 1 }}>
            <Text style={{ fontFamily: theme.uiSemi, fontSize: 11, color: d.hit ? theme.paper : theme.inkFaint }}>{d.label}</Text>
          </View>
        ))}
      </View>

      <Text style={sectionTitle}>Tus reflexiones guardadas</Text>
      {state.notes.length === 0 ? (
        <Text style={{ fontFamily: theme.read, fontSize: 16, color: theme.inkSoft, lineHeight: 24 }}>
          Todavía no has escrito ninguna reflexión. Aparecen aquí cuando respondes el micro-reto del final.
        </Text>
      ) : (
        state.notes.slice().reverse().map((n, i) => (
          <View key={i} style={{ borderTopWidth: 1, borderTopColor: theme.line, paddingVertical: 14 }}>
            <Text style={{ fontFamily: theme.ui, fontSize: 12, color: theme.inkFaint, marginBottom: 6 }}>{n.prompt}</Text>
            <Text style={{ fontFamily: theme.read, fontSize: 16, color: theme.ink, fontStyle: "italic", lineHeight: 23 }}>{n.text}</Text>
          </View>
        ))
      )}

      <View style={{ marginTop: 30 }}><Btn label="Volver" onPress={onBack} theme={theme} variant="ghost" /></View>
      <Pressable onPress={onReset} style={{ marginTop: 16, alignSelf: "center" }} hitSlop={8}>
        <Text style={{ fontFamily: theme.ui, fontSize: 12, color: theme.inkFaint, textDecorationLine: "underline" }}>reiniciar todos los datos</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 26, paddingTop: 56, paddingBottom: 36 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  btn: { borderRadius: 999, paddingVertical: 18, paddingHorizontal: 26, alignItems: "center", justifyContent: "center" },
});

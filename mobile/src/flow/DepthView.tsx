// Modo Depth (§2) — "Tu mente": consultar lo que ya sabes y aportar contenido.
// · Preguntar: recuperación sobre tus átomos + notas (RAG sin la capa de IA).
// · Apuntar una idea → nota en tu grafo.
// · Crear una materia nueva → el pipeline la rellenará (con API key).

import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Theme, THEMES, themeFor } from "../theme";
import { ThemeName, UserModel } from "../types";
import { addNote, addQueue, searchMemory, askAI, MemoryHit } from "../data/contribute";
import { fetchSuggestions, chatWithBrain, generateMateria, aiEnabled, Suggestion } from "../data/ai";
import { Capsule } from "../types";

const WORLDS: ThemeName[] = ["habits", "systems", "behavioral", "wealth", "stoic", "influence", "negotiation", "manson", "ignite", "titans"];

export default function DepthView({ theme, userModel, materias, onSaveUserModel, onCapsulesAdded, onClose }: { theme: Theme; userModel: UserModel; materias: string[]; onSaveUserModel: (um: UserModel) => void; onCapsulesAdded: (caps: Capsule[]) => void; onClose: () => void }) {
  // ── §2 modelo del usuario: quién eres → todo lo que la IA te trae es para ti ──
  const [motivations, setMotivations] = useState(userModel.motivations);
  const [goals, setGoals] = useState(userModel.goals);
  const [interests, setInterests] = useState(userModel.interests);
  const [savedMe, setSavedMe] = useState(false);
  const saveMe = () => {
    onSaveUserModel({ motivations: motivations.trim(), goals: goals.trim(), interests: interests.trim() });
    setSavedMe(true);
  };

  const [q, setQ] = useState("");
  const [hits, setHits] = useState<MemoryHit[] | null>(null);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [picked, setPicked] = useState<ThemeName>("habits");
  const [msg, setMsg] = useState<string | null>(null);

  // sugerencias proactivas (§3): la IA propone qué aprender, leyendo tu «Sobre ti»
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [loadingSug, setLoadingSug] = useState(false);
  const getSuggestions = async () => {
    setLoadingSug(true);
    const s = await fetchSuggestions(userModel, materias);
    setSuggestions(s ?? []);
    setLoadingSug(false);
  };
  // generar = la IA destila la materia en 9-13 cápsulas y las mete en tu Flow ya
  const [generating, setGenerating] = useState<string | null>(null);
  const generateAndAdd = async (t: string, th: ThemeName, intent?: string): Promise<boolean> => {
    setGenerating(t);
    setMsg(null);
    const caps = await generateMateria(t, th, intent);
    setGenerating(null);
    if (caps && caps.length) {
      onCapsulesAdded(caps);
      addQueue({ title: t, type: "topic", theme: th }); // best-effort a la BD si está viva
      setMsg(`«${t}» lista con ${caps.length} cápsulas ✓ — ya están en tu Flow`);
      return true;
    }
    const ok = await addQueue({ title: t, type: "topic", theme: th }); // sin IA: queda registrada
    setMsg(ok ? `Materia «${t}» creada ✓ (la IA no estaba disponible; se llenará con el pipeline)` : "No se pudo crear");
    return ok;
  };

  const useSuggestion = async (sug: Suggestion) => {
    const ok = await generateAndAdd(sug.title, sug.theme as ThemeName, sug.intent);
    if (ok) setSuggestions((prev) => (prev ?? []).filter((x) => x.title !== sug.title));
  };

  const ask = async () => {
    if (!q.trim()) return;
    setSearching(true);
    setAiAnswer(null);
    const memory = await searchMemory(q); // recuperación local de tu conocimiento
    setHits(memory);
    // generación: el proxy diverga contigo apoyándose en lo recuperado (RAG)
    let answer = await chatWithBrain(q, userModel, memory.map((h) => h.body));
    if (!answer) answer = (await askAI(q))?.answer ?? null; // fallback a la Edge Function
    setAiAnswer(answer);
    setSearching(false);
  };
  const saveIdea = async () => {
    if (!idea.trim()) return;
    const ok = await addNote(idea);
    setMsg(ok ? "Idea guardada en tu grafo ✓" : "No se pudo guardar");
    if (ok) setIdea("");
  };
  const createMateria = async () => {
    if (!title.trim()) return;
    const ok = await generateAndAdd(title.trim(), picked);
    if (ok) setTitle("");
  };

  const input = { backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.line, borderRadius: 16, padding: 14, fontFamily: theme.read, fontSize: 16, color: theme.ink } as const;
  const section = { fontFamily: theme.ui, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" as const, color: theme.inkFaint, marginTop: 30, marginBottom: 12 };
  const label = { fontFamily: theme.uiSemi, fontSize: 13, color: theme.inkSoft, marginBottom: 6 };

  return (
    <ScrollView contentContainerStyle={[s.screen, { flexGrow: 1 }]} keyboardShouldPersistTaps="handled">
      <View style={s.head}>
        <Text style={{ fontFamily: theme.display, fontSize: 28, color: theme.ink, letterSpacing: -0.4 }}>Tu mente</Text>
        <Pressable onPress={onClose} hitSlop={10}><Text style={{ fontFamily: theme.ui, fontSize: 13, color: theme.inkFaint }}>cerrar</Text></Pressable>
      </View>

      {/* ── §2 Sobre ti: la base que hace todo personal ── */}
      <Text style={[section, { marginTop: 22 }]}>Sobre ti</Text>
      <Text style={{ fontFamily: theme.read, fontSize: 14, lineHeight: 21, color: theme.inkSoft, marginBottom: 14 }}>
        Cuéntale a Cortex quién eres. Cuanto mejor te entienda, más a tu medida será lo nuevo que te traiga cada vez.
      </Text>
      <Text style={label}>¿Qué te mueve a aprender?</Text>
      <TextInput value={motivations} onChangeText={(t) => { setMotivations(t); setSavedMe(false); }} placeholder="Lo que de verdad te empuja…" placeholderTextColor={theme.inkFaint} multiline style={[input, { minHeight: 56, textAlignVertical: "top" }]} />
      <Text style={[label, { marginTop: 12 }]}>¿Qué quieres conseguir?</Text>
      <TextInput value={goals} onChangeText={(t) => { setGoals(t); setSavedMe(false); }} placeholder="Tus objetivos concretos…" placeholderTextColor={theme.inkFaint} multiline style={[input, { minHeight: 56, textAlignVertical: "top" }]} />
      <Text style={[label, { marginTop: 12 }]}>¿Qué temas te tiran?</Text>
      <TextInput value={interests} onChangeText={(t) => { setInterests(t); setSavedMe(false); }} placeholder="Hábitos, dinero, persuasión, estoicismo…" placeholderTextColor={theme.inkFaint} style={input} />
      <Pressable onPress={saveMe} style={({ pressed }) => [s.btn, { backgroundColor: theme.accent, marginTop: 12 }, pressed && { opacity: 0.85 }]}>
        <Text style={{ fontFamily: theme.uiSemi, fontSize: 15, color: theme.paper }}>{savedMe ? "Guardado ✓" : "Guardar quién soy"}</Text>
      </Pressable>

      {/* ── §3 Cortex te sugiere: proactivo, a tu medida ── */}
      <Text style={section}>Cortex te sugiere</Text>
      <Text style={{ fontFamily: theme.read, fontSize: 14, lineHeight: 21, color: theme.inkSoft, marginBottom: 12 }}>
        {aiEnabled()
          ? "Según quién eres y lo que ya aprendes, esto es lo que tu segundo cerebro te traería ahora."
          : "Las sugerencias en vivo se activan al conectar el proxy de IA (EXPO_PUBLIC_AI_PROXY_URL)."}
      </Text>
      {aiEnabled() && (
        <Pressable onPress={getSuggestions} style={({ pressed }) => [s.btn, { borderWidth: 1.5, borderColor: theme.line }, pressed && { opacity: 0.85 }]}>
          <Text style={{ fontFamily: theme.uiSemi, fontSize: 15, color: theme.ink }}>{loadingSug ? "Pensando qué te traería…" : suggestions ? "Sugerir otras" : "¿Qué aprendo ahora?"}</Text>
        </Pressable>
      )}
      {suggestions && suggestions.length === 0 && !loadingSug && (
        <Text style={{ fontFamily: theme.ui, fontSize: 13, color: theme.inkFaint, marginTop: 10 }}>No hubo sugerencias ahora mismo. Prueba de nuevo en un momento.</Text>
      )}
      {suggestions?.map((sug) => (
        <View key={sug.title} style={{ marginTop: 14, backgroundColor: theme.surface, borderRadius: 16, borderLeftWidth: 3, borderLeftColor: themeFor(sug.theme as ThemeName).accent, padding: 16 }}>
          <Text style={{ fontFamily: theme.display, fontSize: 18, color: theme.ink, lineHeight: 23 }}>{sug.title}</Text>
          <Text style={{ fontFamily: theme.read, fontSize: 14.5, lineHeight: 21, color: theme.inkSoft, marginTop: 6 }}>{sug.why}</Text>
          <Pressable disabled={generating === sug.title} onPress={() => useSuggestion(sug)} style={({ pressed }) => [{ marginTop: 12, alignSelf: "flex-start", borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16, backgroundColor: theme.ink }, (pressed || generating === sug.title) && { opacity: 0.7 }]}>
            <Text style={{ fontFamily: theme.uiSemi, fontSize: 13.5, color: theme.paper }}>{generating === sug.title ? "Generando cápsulas…" : "Generar y añadir  →"}</Text>
          </Pressable>
        </View>
      ))}

      {/* ── Preguntar a tu memoria ── */}
      <Text style={section}>Pregúntale a tu mente</Text>
      <TextInput value={q} onChangeText={setQ} placeholder="¿Qué sé sobre…? (p. ej. hábitos, miedo, dinero)" placeholderTextColor={theme.inkFaint} style={input} onSubmitEditing={ask} returnKeyType="search" />
      <Pressable onPress={ask} style={({ pressed }) => [s.btn, { backgroundColor: theme.ink, marginTop: 10 }, pressed && { opacity: 0.85 }]}>
        <Text style={{ fontFamily: theme.uiSemi, fontSize: 15, color: theme.paper }}>{searching ? "Buscando…" : "Buscar en mi conocimiento"}</Text>
      </Pressable>
      {aiAnswer && (
        <View style={{ marginTop: 16, backgroundColor: theme.surface, borderRadius: 16, borderLeftWidth: 3, borderLeftColor: theme.accent, padding: 16 }}>
          <Text style={{ fontFamily: theme.ui, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: theme.accent, marginBottom: 6 }}>Tu segundo cerebro</Text>
          <Text style={{ fontFamily: theme.read, fontSize: 17, lineHeight: 25, color: theme.ink }}>{aiAnswer}</Text>
        </View>
      )}
      {hits && (
        <View style={{ marginTop: 16 }}>
          {hits.length === 0 ? (
            <Text style={{ fontFamily: theme.read, fontSize: 15, color: theme.inkSoft, lineHeight: 22 }}>Nada en tu mente sobre eso todavía. Aprende o apunta algo abajo.</Text>
          ) : (
            hits.map((h) => (
              <View key={h.kind + h.id} style={{ borderLeftWidth: 3, borderLeftColor: h.theme ? themeFor(h.theme).accent : theme.inkFaint, paddingLeft: 12, marginBottom: 14 }}>
                <Text style={{ fontFamily: theme.ui, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: theme.inkFaint, marginBottom: 3 }}>{h.kind === "note" ? "Tu nota" : h.queueTitle}</Text>
                <Text style={{ fontFamily: theme.read, fontSize: 16, lineHeight: 23, color: theme.ink }}>{h.body.length > 200 ? h.body.slice(0, 200) + "…" : h.body}</Text>
              </View>
            ))
          )}
          <Text style={{ fontFamily: theme.ui, fontSize: 12, color: theme.inkFaint, marginTop: 6, lineHeight: 18 }}>
            Esto es lo que recuperé de tu conocimiento.{aiEnabled() ? " La respuesta de arriba la divaga tu segundo cerebro apoyándose en ello." : " La respuesta conversacional se activa al conectar el proxy de IA."}
          </Text>
        </View>
      )}

      {/* ── Apuntar una idea ── */}
      <Text style={section}>Apunta una idea</Text>
      <TextInput value={idea} onChangeText={setIdea} placeholder="Algo que pensaste y quieres guardar…" placeholderTextColor={theme.inkFaint} multiline style={[input, { minHeight: 70, textAlignVertical: "top" }]} />
      <Pressable onPress={saveIdea} style={({ pressed }) => [s.btn, { borderWidth: 1.5, borderColor: theme.line, marginTop: 10 }, pressed && { opacity: 0.85 }]}>
        <Text style={{ fontFamily: theme.uiSemi, fontSize: 15, color: theme.ink }}>Guardar en mi grafo</Text>
      </Pressable>

      {/* ── Crear una materia ── */}
      <Text style={section}>Nueva materia para aprender</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Un libro, una skill, un tema…" placeholderTextColor={theme.inkFaint} style={input} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {WORLDS.map((w) => (
          <Pressable key={w} onPress={() => setPicked(w)} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: themeFor(w).accent, borderWidth: picked === w ? 3 : 0, borderColor: theme.ink }} />
        ))}
      </View>
      <Pressable disabled={generating === title.trim()} onPress={createMateria} style={({ pressed }) => [s.btn, { borderWidth: 1.5, borderColor: theme.line, marginTop: 12 }, (pressed || generating === title.trim()) && { opacity: 0.7 }]}>
        <Text style={{ fontFamily: theme.uiSemi, fontSize: 15, color: theme.ink }}>{generating === title.trim() && title.trim() ? "Generando cápsulas…" : aiEnabled() ? "Crear y generar cápsulas" : "Crear materia"}</Text>
      </Pressable>

      {msg && <Text style={{ fontFamily: theme.ui, fontSize: 13, color: theme.accent, marginTop: 16, textAlign: "center" }}>{msg}</Text>}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 26, paddingTop: 56, paddingBottom: 36 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  btn: { borderRadius: 999, paddingVertical: 15, paddingHorizontal: 22, alignItems: "center", justifyContent: "center" },
});

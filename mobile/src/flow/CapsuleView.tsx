// Renderer genérico de cápsula (§8): despacha por capsule.format, aplica el
// mundo visual de la materia, y usa Reanimated (animación en hilo de UI) +
// Gesture Handler (swipe vertical, con tap de respaldo). §4 + §11.

import React, { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming, withDelay, runOnJS, Easing } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { ActivityPayload, BridgePayload, Capsule, CoachPayload, InteractivePayload, MotionPayload, NarrativePayload, QuizPayload, RecallPayload, ReviewGrade, StatPayload, VisualPayload } from "../types";
import { Theme } from "../theme";
import { buildScene } from "./scenes";
import AiFace from "./AiFace";

interface Props {
  capsule: Capsule;
  theme: Theme;
  isSaved: boolean;
  onToggleSave: () => void;
  onComplete: () => void;
  onReview: (grade: ReviewGrade) => void;
  onClose: () => void;
}

export default function CapsuleView({ capsule, theme, isSaved, onToggleSave, onComplete, onReview, onClose }: Props) {
  return (
    <View style={[styles.fill, { backgroundColor: theme.paper }]}>
      <View style={styles.head}>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: theme.accent }]} />
          <Text style={{ color: theme.inkSoft, fontFamily: monoOrUi(theme), fontSize: 13 }}>{capsule.queue.title}</Text>
        </View>
        <View style={[styles.row, { gap: 18 }]}>
          <Pressable onPress={onToggleSave} hitSlop={10}>
            <Text style={{ color: isSaved ? theme.accent : theme.inkFaint, fontSize: 19 }}>{isSaved ? "★" : "☆"}</Text>
          </Pressable>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={{ color: theme.inkFaint, fontFamily: theme.ui, fontSize: 13 }}>cerrar</Text>
          </Pressable>
        </View>
      </View>

      {/* key={capsule.id}: remonta el cuerpo en cada cápsula → las entradas se reproducen */}
      {capsule.format === "narrative" && <NarrativeBody key={capsule.id} payload={capsule.payload} theme={theme} onComplete={onComplete} />}
      {capsule.format === "interactive" && <InteractiveBody key={capsule.id} payload={capsule.payload} theme={theme} onComplete={onComplete} />}
      {capsule.format === "bridge" && <BridgeBody key={capsule.id} payload={capsule.payload} theme={theme} onComplete={onComplete} />}
      {capsule.format === "visual" && <VisualBody key={capsule.id} payload={capsule.payload} theme={theme} onComplete={onComplete} />}
      {capsule.format === "recall" && <RecallBody key={capsule.id} payload={capsule.payload} theme={theme} onReview={onReview} />}
      {capsule.format === "stat" && <StatBody key={capsule.id} payload={capsule.payload} theme={theme} onComplete={onComplete} />}
      {capsule.format === "motion" && <MotionBody key={capsule.id} payload={capsule.payload} theme={theme} onComplete={onComplete} />}
      {capsule.format === "quiz" && <QuizBody key={capsule.id} payload={capsule.payload} theme={theme} onComplete={onComplete} />}
      {capsule.format === "activity" && <ActivityBody key={capsule.id} payload={capsule.payload} theme={theme} onComplete={onComplete} />}
      {capsule.format === "coach" && <CoachBody key={capsule.id} payload={capsule.payload} theme={theme} onComplete={onComplete} />}
    </View>
  );
}

const monoOrUi = (t: Theme) => (t.kicker === "SpaceMono_400Regular" ? t.kicker : t.ui);

// gesto compartido: swipe arriba = avanzar, abajo = retroceder, tap = avanzar
function makeAdvanceGesture(go: (d: number) => void) {
  const tap = Gesture.Tap().onEnd(() => runOnJS(go)(1));
  const pan = Gesture.Pan().onEnd((e) => {
    "worklet";
    if (Math.abs(e.translationY) <= Math.abs(e.translationX)) return;
    if (e.translationY < -45) runOnJS(go)(1);
    else if (e.translationY > 45) runOnJS(go)(-1);
  });
  return Gesture.Exclusive(pan, tap);
}

// ease-out: las entradas deceleran (animation-principles). Bajo 400ms = ágil.
const EASE = Easing.out(Easing.cubic);

// entrada coreografiada: fade + slide-up, con delay opcional para escalonar (stagger).
function useReveal(dep: unknown, delay = 0) {
  const op = useSharedValue(0);
  const ty = useSharedValue(16);
  useEffect(() => {
    op.value = 0;
    ty.value = 16;
    op.value = withDelay(delay, withTiming(1, { duration: 380, easing: EASE }));
    ty.value = withDelay(delay, withTiming(0, { duration: 380, easing: EASE }));
  }, [dep]);
  return useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: ty.value }] }));
}

// entrada con énfasis: aparece escalando con overshoot (back). Para la cifra del stat.
function usePopReveal(delay = 0) {
  const op = useSharedValue(0);
  const sc = useSharedValue(0.8);
  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 420, easing: EASE }));
    sc.value = withDelay(delay, withTiming(1, { duration: 560, easing: Easing.out(Easing.back(1.8)) }));
  }, []);
  return useAnimatedStyle(() => ({ opacity: op.value, transform: [{ scale: sc.value }] }));
}

// agrupa miles con un separador dado (Intl no agrupa en este motor → manual).
function groupThousands(n: number, sep: string): string {
  if (!sep) return String(n);
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

// cuenta de 0 al número de `figure` conservando prefijo, sufijo y el separador de
// miles del original ("1.800" cuenta y termina en "1.800", no "1800").
// JS thread (el texto no se anima en el hilo de UI), pero a 60fps se ve fluido.
function useCountUp(figure: string, duration = 900): string {
  const m = figure.match(/^(\D*)([\d.,]+)(\D*)$/);
  const sep = m ? (m[2].includes(".") ? "." : m[2].includes(",") ? "," : "") : "";
  const target = m ? parseInt(m[2].replace(/[.,]/g, ""), 10) : NaN;
  const animated = !!m && Number.isFinite(target);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!animated) return;
    let raf = 0;
    let start = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // ease-out cúbica
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setVal(Math.round(ease(p) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  if (!animated) return figure;
  return `${m![1]}${groupThousands(val, sep)}${m![3]}`;
}

// ── NARRATIVE ─────────────────────────────────────────────────────
const KIND_LABEL: Record<string, string> = { hook: "El gancho", develop: "", twist: "El giro" };

function NarrativeBody({ payload, theme, onComplete }: { payload: NarrativePayload; theme: Theme; onComplete: () => void }) {
  const slides = payload.slides;
  const [idx, setIdx] = useState(0);
  const kickerIn = useReveal(idx);       // el kicker entra primero…
  const textIn = useReveal(idx, 70);     // …y el texto le sigue (stagger)
  const go = (d: number) => {
    const n = idx + d;
    if (n < 0) return;
    if (n >= slides.length) return onComplete();
    setIdx(n);
  };
  const gesture = makeAdvanceGesture(go);
  const sl = slides[idx];
  const isLast = idx === slides.length - 1;
  const tStyle =
    sl.type === "hook"
      ? { fontFamily: theme.display, fontSize: 38, lineHeight: 42, color: theme.ink, letterSpacing: -0.6 }
      : sl.type === "twist"
      ? { fontFamily: theme.displayItalic, fontSize: 31, lineHeight: 37, color: theme.accent2, letterSpacing: -0.4 }
      : { fontFamily: theme.read, fontSize: 23, lineHeight: 34, color: theme.ink };
  const kColor = sl.type === "hook" ? theme.accent : sl.type === "twist" ? theme.accent2 : theme.inkFaint;

  return (
    <>
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dotsTrack, { backgroundColor: theme.line }]}>
            <View style={{ height: "100%", borderRadius: 2, backgroundColor: theme.ink, width: i <= idx ? "100%" : "0%" }} />
          </View>
        ))}
      </View>
      <GestureDetector gesture={gesture}>
        <View style={styles.body}>
          <View style={styles.bodyPad}>
            <Reanimated.View style={kickerIn}>
              <Kicker theme={theme} color={kColor}>{KIND_LABEL[sl.type] || " "}</Kicker>
            </Reanimated.View>
            <Reanimated.View style={textIn}>
              <Text style={tStyle}>{sl.text}</Text>
            </Reanimated.View>
          </View>
        </View>
      </GestureDetector>
      <Cue theme={theme}>{isLast ? "desliza ↑ para reflexionar" : "desliza ↑ o toca para seguir"}</Cue>
    </>
  );
}

// ── INTERACTIVE ───────────────────────────────────────────────────
function InteractiveBody({ payload, theme, onComplete }: { payload: InteractivePayload; theme: Theme; onComplete: () => void }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const reveal = useReveal(chosen);
  return (
    <View style={[styles.body, styles.bodyPad]}>
      <Kicker theme={theme} color={theme.accent}>Elige</Kicker>
      <Text style={{ fontFamily: theme.display, fontSize: 30, lineHeight: 36, color: theme.ink, letterSpacing: -0.4, marginBottom: 26 }}>
        {payload.scenario}
      </Text>
      {chosen === null ? (
        payload.choices.map((c, i) => (
          <Pressable key={i} onPress={() => setChosen(i)} style={({ pressed }) => [styles.choice, { borderColor: pressed ? theme.accent : theme.line, backgroundColor: theme.surface }]}>
            <Text style={{ fontFamily: theme.uiSemi, fontSize: 17, color: theme.ink }}>{c.label}</Text>
          </Pressable>
        ))
      ) : (
        <Reanimated.View style={reveal}>
          <Text style={{ fontFamily: theme.uiSemi, fontSize: 17, color: theme.ink, marginBottom: 8 }}>{payload.choices[chosen].label}</Text>
          <Text style={{ fontFamily: theme.read, fontSize: 19, lineHeight: 28, color: theme.inkSoft }}>{payload.choices[chosen].outcome}</Text>
          <Text style={{ fontFamily: theme.displayItalic, fontSize: 22, lineHeight: 30, color: theme.accent2, marginTop: 22 }}>{payload.insight}</Text>
          <Pressable onPress={onComplete} style={({ pressed }) => [styles.primary, { backgroundColor: theme.ink, marginTop: 30 }, pressed && { opacity: 0.85 }]}>
            <Text style={{ fontFamily: theme.uiSemi, fontSize: 16, color: theme.paper }}>Seguir  →</Text>
          </Pressable>
        </Reanimated.View>
      )}
    </View>
  );
}

// ── BRIDGE ────────────────────────────────────────────────────────
function BridgeBody({ payload, theme, onComplete }: { payload: BridgePayload; theme: Theme; onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  const reveal = useReveal(stage);
  const go = (d: number) => {
    const n = stage + d;
    if (n < 0) return;
    if (n > 2) return onComplete();
    setStage(n);
  };
  const gesture = makeAdvanceGesture(go);
  const Atom = ({ a, color }: { a: { title: string; queue: string }; color: string }) => (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ fontFamily: theme.ui, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color, marginBottom: 6 }}>{a.queue}</Text>
      <Text style={{ fontFamily: theme.display, fontSize: 26, lineHeight: 31, color: theme.ink }}>{a.title}</Text>
    </View>
  );
  return (
    <>
      <GestureDetector gesture={gesture}>
        <View style={styles.body}>
          <Reanimated.View style={[styles.bodyPad, reveal]}>
            <Kicker theme={theme} color={theme.accent}>El puente</Kicker>
            <Atom a={payload.atom_a} color={theme.accent} />
            {stage >= 1 && <Text style={{ fontFamily: theme.display, fontSize: 24, color: theme.inkFaint, marginBottom: 18 }}>⟷</Text>}
            {stage >= 1 && <Atom a={payload.atom_b} color={theme.accent2} />}
            {stage >= 2 && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontFamily: theme.read, fontSize: 19, lineHeight: 28, color: theme.inkSoft }}>{payload.rationale}</Text>
                <Text style={{ fontFamily: theme.displayItalic, fontSize: 23, lineHeight: 31, color: theme.accent2, marginTop: 20 }}>{payload.question}</Text>
              </View>
            )}
          </Reanimated.View>
        </View>
      </GestureDetector>
      <Cue theme={theme}>{stage >= 2 ? "desliza ↑ para reflexionar" : "desliza ↑ o toca para revelar"}</Cue>
    </>
  );
}

// ── VISUAL — mapa conceptual con SVG (§8) ─────────────────────────
function VisualBody({ payload, theme, onComplete }: { payload: VisualPayload; theme: Theme; onComplete: () => void }) {
  const reveal = useReveal(0);
  const gesture = makeAdvanceGesture(() => onComplete());
  const SIZE = 300, cx = 150, cy = 150, R = 98, nr = 46;
  const pos: Record<string, { x: number; y: number; label: string }> = {};
  payload.nodes.forEach((n, i) => {
    const a = ((-90 + (i * 360) / payload.nodes.length) * Math.PI) / 180;
    pos[n.id] = { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), label: n.label };
  });
  return (
    <>
      <GestureDetector gesture={gesture}>
        <View style={[styles.body, { alignItems: "center" }]}>
          <Reanimated.View style={[reveal, { alignItems: "center", paddingHorizontal: 24 }]}>
            <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
              {payload.edges.map((e, i) => {
                const a = pos[e.from], b = pos[e.to];
                if (!a || !b) return null;
                return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={theme.accent} strokeWidth={1.5} opacity={0.55} />;
              })}
              {payload.nodes.map((n, i) => {
                const p = pos[n.id];
                return (
                  <React.Fragment key={n.id}>
                    <Circle cx={p.x} cy={p.y} r={nr} fill={theme.surface} stroke={i === 0 ? theme.accent : theme.line} strokeWidth={1.5} />
                    <SvgText x={p.x} y={p.y + 4} fill={theme.ink} fontSize={12.5} fontFamily={theme.uiSemi} textAnchor="middle">
                      {p.label}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
            <Text style={{ fontFamily: theme.read, fontSize: 19, lineHeight: 27, color: theme.inkSoft, textAlign: "center", marginTop: 18 }}>
              {payload.caption}
            </Text>
          </Reanimated.View>
        </View>
      </GestureDetector>
      <Cue theme={theme}>desliza ↑ o toca para reflexionar</Cue>
    </>
  );
}

// ── RECALL — repaso espaciado: pregunta → revelar (§8, §7) ────────
function RecallBody({ payload, theme, onReview }: { payload: RecallPayload; theme: Theme; onReview: (g: ReviewGrade) => void }) {
  const [revealed, setRevealed] = useState(false);
  const reveal = useReveal(revealed);
  // antes de revelar: tap/swipe muestra la respuesta. Después: autocalificación (SM-2).
  const gesture = makeAdvanceGesture((d) => { if (d >= 0 && !revealed) setRevealed(true); });
  const grades: { g: ReviewGrade; label: string; color: string }[] = [
    { g: "again", label: "No me acordaba", color: theme.accent2 },
    { g: "hard", label: "A medias", color: theme.inkSoft },
    { g: "good", label: "Lo recordaba", color: theme.accent },
  ];
  return (
    <>
      <GestureDetector gesture={gesture}>
        <View style={styles.body}>
          <Reanimated.View style={[styles.bodyPad, reveal]}>
            <Kicker theme={theme} color={theme.accent}>Repaso</Kicker>
            <Text style={{ fontFamily: theme.display, fontSize: revealed ? 22 : 30, lineHeight: revealed ? 28 : 36, color: revealed ? theme.inkSoft : theme.ink, letterSpacing: -0.4 }}>
              {payload.prompt}
            </Text>
            {revealed && (
              <Text style={{ fontFamily: theme.read, fontSize: 24, lineHeight: 34, color: theme.ink, marginTop: 24 }}>{payload.reveal}</Text>
            )}
          </Reanimated.View>
        </View>
      </GestureDetector>
      {revealed ? (
        <View style={styles.gradeRow}>
          {grades.map((it) => (
            <Pressable key={it.g} onPress={() => onReview(it.g)} style={({ pressed }) => [styles.grade, { borderColor: it.color }, pressed && { backgroundColor: theme.surface }]}>
              <Text style={{ fontFamily: theme.uiSemi, fontSize: 13, color: it.color, textAlign: "center" }}>{it.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Cue theme={theme}>desliza ↑ o toca para revelar</Cue>
      )}
    </>
  );
}

// ── STAT — una cifra que golpea → toque revela el giro (§8) ───────
function StatBody({ payload, theme, onComplete }: { payload: StatPayload; theme: Theme; onComplete: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const counted = useCountUp(payload.figure); // la cifra sube de 0 a su valor
  // entrada coreografiada: kicker → cifra (pop) → unidad → claim, escalonadas
  const kickerIn = useReveal(0, 0);
  const figureIn = usePopReveal(110);
  const unitIn = useReveal(0, 300);
  const claimIn = useReveal(0, 380);
  const revealIn = useReveal(revealed);
  const go = (d: number) => {
    if (d < 0) return;
    if (!revealed) setRevealed(true);
    else onComplete();
  };
  const gesture = makeAdvanceGesture(go);
  return (
    <>
      <GestureDetector gesture={gesture}>
        <View style={[styles.body, { alignItems: "center" }]}>
          <View style={[styles.bodyPad, { alignItems: "center" }]}>
            <Reanimated.View style={kickerIn}>
              <Kicker theme={theme} color={theme.accent}>El dato</Kicker>
            </Reanimated.View>
            <Reanimated.View style={figureIn}>
              <Text style={{ fontFamily: theme.display, fontSize: 96, lineHeight: 100, color: theme.accent, letterSpacing: -2, textAlign: "center" }}>
                {counted}
              </Text>
            </Reanimated.View>
            {!!payload.unit && (
              <Reanimated.View style={unitIn}>
                <Text style={{ fontFamily: theme.ui, fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase", color: theme.inkFaint, marginTop: 4, textAlign: "center" }}>
                  {payload.unit}
                </Text>
              </Reanimated.View>
            )}
            <Reanimated.View style={claimIn}>
              <Text style={{ fontFamily: theme.display, fontSize: 27, lineHeight: 33, color: theme.ink, letterSpacing: -0.4, marginTop: 26, textAlign: "center" }}>
                {payload.claim}
              </Text>
            </Reanimated.View>
            {revealed && (
              <Reanimated.View style={revealIn}>
                <Text style={{ fontFamily: theme.read, fontSize: 21, lineHeight: 30, color: theme.accent2, marginTop: 24, textAlign: "center" }}>
                  {payload.reveal}
                </Text>
              </Reanimated.View>
            )}
          </View>
        </View>
      </GestureDetector>
      <Cue theme={theme}>{revealed ? "desliza ↑ para reflexionar" : "desliza ↑ o toca para revelar"}</Cue>
    </>
  );
}

// ── MOTION — escena animada HTML+GSAP (§8) ───────────────────────
// En web la incrustamos como <iframe srcDoc>; en nativo, react-native-webview.
function HtmlScene({ html }: { html: string }) {
  if (Platform.OS === "web") {
    return React.createElement("iframe", {
      srcDoc: html,
      sandbox: "allow-scripts",
      style: { width: "100%", height: "100%", border: "0", display: "block", background: "transparent" },
    });
  }
  const WebView = require("react-native-webview").WebView;
  return <WebView source={{ html }} style={{ flex: 1, backgroundColor: "transparent" }} originWhitelist={["*"]} scrollEnabled={false} />;
}

function MotionBody({ payload, theme, onComplete }: { payload: MotionPayload; theme: Theme; onComplete: () => void }) {
  const html = useMemo(() => buildScene(payload.render, theme, payload.title, payload.caption), [payload.render, payload.title, payload.caption, theme]);
  const reveal = useReveal(0);
  return (
    <>
      <Reanimated.View style={[styles.body, reveal, { overflow: "hidden" }]}>
        {/* la escena (iframe/WebView) captura el toque, así que avanzamos con el botón */}
        <HtmlScene html={html} />
      </Reanimated.View>
      <View style={styles.motionCta}>
        <Pressable onPress={onComplete} style={({ pressed }) => [styles.primary, { backgroundColor: theme.ink }, pressed && { opacity: 0.85 }]}>
          <Text style={{ fontFamily: theme.uiSemi, fontSize: 16, color: theme.paper }}>Seguir  →</Text>
        </Pressable>
      </View>
    </>
  );
}

// ── QUIZ — pregunta → eliges → correcto/incorrecto + por qué (§8) ─
function QuizBody({ payload, theme, onComplete }: { payload: QuizPayload; theme: Theme; onComplete: () => void }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const reveal = useReveal(chosen);
  return (
    <View style={[styles.body, styles.bodyPad]}>
      <Kicker theme={theme} color={theme.accent}>Pon a prueba</Kicker>
      <Text style={{ fontFamily: theme.display, fontSize: 28, lineHeight: 34, color: theme.ink, letterSpacing: -0.4, marginBottom: 24 }}>{payload.question}</Text>
      {chosen === null ? (
        payload.options.map((o, i) => (
          <Pressable key={i} onPress={() => setChosen(i)} style={({ pressed }) => [styles.choice, { borderColor: pressed ? theme.accent : theme.line, backgroundColor: theme.surface }]}>
            <Text style={{ fontFamily: theme.uiSemi, fontSize: 16, color: theme.ink }}>{o.label}</Text>
          </Pressable>
        ))
      ) : (
        <Reanimated.View style={reveal}>
          {payload.options.map((o, i) => {
            const col = o.correct ? "#3fb950" : i === chosen ? theme.accent2 : theme.line;
            return (
              <View key={i} style={[styles.choice, { borderColor: col, backgroundColor: theme.surface, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
                <Text style={{ fontFamily: theme.uiSemi, fontSize: 16, color: theme.ink, flex: 1 }}>{o.label}</Text>
                {o.correct && <Text style={{ color: "#3fb950", fontSize: 17 }}>✓</Text>}
                {i === chosen && !o.correct && <Text style={{ color: theme.accent2, fontSize: 17 }}>✗</Text>}
              </View>
            );
          })}
          <Text style={{ fontFamily: theme.read, fontSize: 18, lineHeight: 27, color: theme.inkSoft, marginTop: 18 }}>
            {payload.options[chosen]?.correct ? "Correcto. " : "No exactamente. "}{payload.explanation}
          </Text>
          <Pressable onPress={onComplete} style={({ pressed }) => [styles.primary, { backgroundColor: theme.ink, marginTop: 26 }, pressed && { opacity: 0.85 }]}>
            <Text style={{ fontFamily: theme.uiSemi, fontSize: 16, color: theme.paper }}>Seguir  →</Text>
          </Pressable>
        </Reanimated.View>
      )}
    </View>
  );
}

// ── ACTIVITY — un reto para hacer en el mundo real (§8) ───────────
function ActivityBody({ payload, theme, onComplete }: { payload: ActivityPayload; theme: Theme; onComplete: () => void }) {
  const reveal = useReveal(0);
  return (
    <View style={[styles.body, styles.bodyPad]}>
      <Reanimated.View style={reveal}>
        <Kicker theme={theme} color={theme.accent}>Tu reto</Kicker>
        <Text style={{ fontFamily: theme.display, fontSize: 29, lineHeight: 35, color: theme.ink, letterSpacing: -0.4 }}>{payload.challenge}</Text>
        {!!payload.steps?.length && (
          <View style={{ marginTop: 20 }}>
            {payload.steps.map((s, i) => (
              <View key={i} style={{ flexDirection: "row", marginBottom: 10 }}>
                <Text style={{ fontFamily: theme.uiSemi, fontSize: 16, color: theme.accent, marginRight: 10 }}>{i + 1}.</Text>
                <Text style={{ fontFamily: theme.read, fontSize: 17, lineHeight: 25, color: theme.ink, flex: 1 }}>{s}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={{ fontFamily: theme.displayItalic, fontSize: 20, lineHeight: 28, color: theme.accent2, marginTop: 22 }}>{payload.why}</Text>
        <Pressable onPress={onComplete} style={({ pressed }) => [styles.primary, { backgroundColor: theme.ink, marginTop: 28 }, pressed && { opacity: 0.85 }]}>
          <Text style={{ fontFamily: theme.uiSemi, fontSize: 16, color: theme.paper }}>Hecho  →</Text>
        </Pressable>
      </Reanimated.View>
    </View>
  );
}

// ── COACH — la IA te pone cara y te pregunta DIRECTO a ti (§8, §11) ─
function CoachBody({ payload, theme, onComplete }: { payload: CoachPayload; theme: Theme; onComplete: () => void }) {
  const [answered, setAnswered] = useState(false);
  const [text, setText] = useState("");
  const reveal = useReveal(answered);
  return (
    <View style={[styles.body, styles.bodyPad]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <AiFace theme={theme} size={54} speaking={!answered} />
        <Text style={{ fontFamily: theme.kicker, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: theme.accent }}>{theme.kickerPrefix}Cortex te pregunta</Text>
      </View>
      <Text style={{ fontFamily: theme.display, fontSize: 28, lineHeight: 35, color: theme.ink, letterSpacing: -0.4 }}>{payload.question}</Text>
      {!answered ? (
        <>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            placeholder={payload.placeholder || "Respóndele a tu segundo cerebro…"}
            placeholderTextColor={theme.inkFaint}
            style={{ marginTop: 22, minHeight: 88, backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.line, borderRadius: 16, padding: 15, fontFamily: theme.read, fontSize: 17, color: theme.ink, textAlignVertical: "top" }}
          />
          <Pressable onPress={() => setAnswered(true)} style={({ pressed }) => [styles.primary, { backgroundColor: theme.ink, marginTop: 18 }, pressed && { opacity: 0.85 }]}>
            <Text style={{ fontFamily: theme.uiSemi, fontSize: 16, color: theme.paper }}>{text.trim() ? "Responder  →" : "Saltar  →"}</Text>
          </Pressable>
        </>
      ) : (
        <Reanimated.View style={reveal}>
          {!!text.trim() && <Text style={{ fontFamily: theme.read, fontSize: 16, lineHeight: 24, color: theme.inkSoft, fontStyle: "italic", marginTop: 18 }}>"{text.trim()}"</Text>}
          <Text style={{ fontFamily: theme.read, fontSize: 20, lineHeight: 29, color: theme.ink, marginTop: 18 }}>{payload.followUp}</Text>
          <Pressable onPress={onComplete} style={({ pressed }) => [styles.primary, { backgroundColor: theme.ink, marginTop: 28 }, pressed && { opacity: 0.85 }]}>
            <Text style={{ fontFamily: theme.uiSemi, fontSize: 16, color: theme.paper }}>Seguir  →</Text>
          </Pressable>
        </Reanimated.View>
      )}
    </View>
  );
}

// ── piezas compartidas ────────────────────────────────────────────
const Kicker = ({ theme, color, children }: { theme: Theme; color: string; children: React.ReactNode }) => (
  <Text style={{ fontFamily: theme.kicker, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color, marginBottom: 20 }}>
    {theme.kickerPrefix}
    {children}
  </Text>
);

const Cue = ({ theme, children }: { theme: Theme; children: React.ReactNode }) => (
  <View style={styles.cue}>
    <Text style={{ color: theme.inkFaint, fontFamily: monoOrUi(theme), fontSize: 12.5 }}>↓ {children}</Text>
  </View>
);

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 9 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 26, paddingTop: 18 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  dots: { flexDirection: "row", gap: 6, paddingHorizontal: 26, paddingTop: 16 },
  dotsTrack: { height: 3, flex: 1, borderRadius: 2, overflow: "hidden" },
  body: { flex: 1, justifyContent: "center" },
  bodyPad: { paddingHorizontal: 30 },
  cue: { paddingHorizontal: 30, paddingBottom: 28 },
  choice: { borderWidth: 1.5, borderRadius: 16, padding: 18, marginBottom: 12 },
  primary: { borderRadius: 999, paddingVertical: 18, paddingHorizontal: 26, alignItems: "center" },
  motionCta: { paddingHorizontal: 30, paddingBottom: 28, paddingTop: 8 },
  gradeRow: { flexDirection: "row", gap: 8, paddingHorizontal: 26, paddingBottom: 28 },
  grade: { flex: 1, borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 6, alignItems: "center", justifyContent: "center" },
});

// Tipos de dominio de Cortex (§3, §8 del plan). Compartidos por la app y,
// el día de mañana, por las Edge Functions. Español de España en el contenido.

export type ThemeName = "neutral" | "habits" | "systems" | "bridge" | "behavioral" | "stoic" | "wealth" | "influence" | "negotiation" | "manson" | "ignite" | "titans";

export type QueueType = "book" | "skill" | "concept" | "topic" | "bridge";

export interface Queue {
  title: string;
  type: QueueType;
  theme: ThemeName; // identidad visual de la materia (§11)
}

export type SlideKind = "hook" | "develop" | "twist";
export interface Slide {
  type: SlideKind;
  text: string;
}

export type CapsuleFormat = "narrative" | "interactive" | "visual" | "bridge" | "recall" | "stat" | "motion" | "quiz" | "activity";

// ── payloads por formato (§8) ────────────────────────────────────
export interface NarrativePayload {
  slides: Slide[];
}
export interface InteractivePayload {
  scenario: string;
  choices: { label: string; outcome: string }[];
  insight: string;
}
export interface BridgePayload {
  atom_a: { title: string; queue: string };
  atom_b: { title: string; queue: string };
  rationale: string;
  question: string;
}
export interface VisualPayload {
  render: "concept_map";
  nodes: { id: string; label: string }[];
  edges: { from: string; to: string }[];
  caption: string;
}
export interface RecallPayload {
  prompt: string; // la pregunta de recuerdo (antes de revelar)
  reveal: string; // la idea central que se revela
}
export interface StatPayload {
  figure: string; // la cifra que golpea, p.ej. "37×", "92 %", "0"
  unit?: string; // matiz bajo la cifra, p.ej. "mejor en un año"
  claim: string; // la afirmación que contextualiza la cifra
  reveal: string; // el giro contraintuitivo que se revela al tocar
}
export interface MotionPayload {
  render: string; // escena animada: "habit_loop" | "compound" | "anchor" | …
  title: string; // titular de la escena
  caption: string; // una línea bajo la animación
}
export interface QuizPayload {
  question: string;
  options: { label: string; correct: boolean }[]; // 2-4 opciones, exactamente una correcta
  explanation: string; // por qué la correcta lo es (el aprendizaje)
}
export interface ActivityPayload {
  challenge: string; // el reto/ejercicio para hacer (hoy, en el mundo real)
  steps?: string[]; // pasos opcionales
  why: string; // por qué merece la pena (el principio detrás)
}

// ── Cápsula como UNIÓN DISCRIMINADA por `format` ──────────────────
// Así el renderer narrows el payload con un switch(capsule.format).
interface BaseCapsule {
  id: string;
  atom_id?: string | null; // id del knowledge_atom subyacente (solo si viene de la BD); para saved_atoms/user_notes
  reviewKey?: string; // qué clave de repaso (SM-2) califica esta cápsula; en auto-recalls = id de la fuente (§7)
  queue: Queue;
  novelty_score: number; // 0-1, cuán contraintuitivo (gancho)
  estimated_seconds: number;
  reflection_prompt: string; // el micro-reto del final (§7)
}
export interface NarrativeCapsule extends BaseCapsule {
  format: "narrative";
  payload: NarrativePayload;
}
export interface InteractiveCapsule extends BaseCapsule {
  format: "interactive";
  payload: InteractivePayload;
}
export interface BridgeCapsule extends BaseCapsule {
  format: "bridge";
  payload: BridgePayload;
}
export interface VisualCapsule extends BaseCapsule {
  format: "visual";
  payload: VisualPayload;
}
export interface RecallCapsule extends BaseCapsule {
  format: "recall";
  payload: RecallPayload;
}
export interface StatCapsule extends BaseCapsule {
  format: "stat";
  payload: StatPayload;
}
export interface MotionCapsule extends BaseCapsule {
  format: "motion";
  payload: MotionPayload;
}
export interface QuizCapsule extends BaseCapsule {
  format: "quiz";
  payload: QuizPayload;
}
export interface ActivityCapsule extends BaseCapsule {
  format: "activity";
  payload: ActivityPayload;
}
export type Capsule = NarrativeCapsule | InteractiveCapsule | BridgeCapsule | VisualCapsule | RecallCapsule | StatCapsule | MotionCapsule | QuizCapsule | ActivityCapsule;

// ── Telemetría (§7) ───────────────────────────────────────────────
export type InteractionAction = "served" | "completed" | "skipped" | "saved" | "reflected";
export interface InteractionEvent {
  action: InteractionAction;
  capsuleId: string | null;
  ts: number;
}
export interface Note {
  capsuleId: string;
  prompt: string;
  text: string;
  day: string;
}

// ── Repaso espaciado (SM-2 lite, §7) ──────────────────────────────
export type ReviewGrade = "again" | "hard" | "good";
export interface ReviewState {
  reps: number; // repasos correctos seguidos
  ease: number; // factor de facilidad (≈2.5 inicial)
  intervalDays: number; // intervalo actual
  due: number; // epoch ms en que vuelve a tocar
}

// ── Modelo del usuario (§2, pilar que hace todo personal) ─────────
export interface UserModel {
  motivations: string; // qué te mueve / para qué aprendes
  goals: string; // objetivos concretos
  interests: string; // temas que te interesan
}

// ── Estado persistido ─────────────────────────────────────────────
export interface ExperimentState {
  firstDay: string;
  byDay: Record<string, number>;
  seen: Record<string, true>;
  saved: string[];
  notes: Note[];
  events: InteractionEvent[];
  reviews: Record<string, ReviewState>; // clave = id de la cápsula fuente (§7)
  userModel: UserModel; // §2: quién eres y qué te mueve → hace todo personal
}

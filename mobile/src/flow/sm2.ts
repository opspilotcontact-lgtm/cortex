// Repaso espaciado — SM-2 lite (§7). Decide CUÁNDO vuelve a tocar repasar una
// idea según lo bien que la recordaste. Es el "sistema de aprendizaje": la
// retención no se busca por adicción, sino fijando el conocimiento en el tiempo.
//
// Grados: "again" (no me acordaba) · "hard" (a medias) · "good" (lo recordaba).
// Intervalos expansivos (1d → 2d → ×ease…) que se alargan si recuerdas bien y
// se reinician si fallas. Determinista y puro → testeable.

import { ReviewGrade, ReviewState } from "../types";

const DAY = 86_400_000;
const EASE_MIN = 1.3;
const EASE_MAX = 2.8;

// primer repaso al día siguiente de aprender algo nuevo.
export function firstSchedule(now: number): ReviewState {
  return { reps: 0, ease: 2.5, intervalDays: 1, due: now + DAY };
}

export function schedule(prev: ReviewState | undefined, grade: ReviewGrade, now: number): ReviewState {
  const ease0 = prev?.ease ?? 2.5;

  // fallo → vuelve a empezar mañana, baja la facilidad
  if (grade === "again") {
    return { reps: 0, ease: Math.max(EASE_MIN, ease0 - 0.2), intervalDays: 1, due: now + DAY };
  }

  const ease = grade === "hard" ? Math.max(EASE_MIN, ease0 - 0.15) : Math.min(EASE_MAX, ease0 + 0.1);
  const reps = (prev?.reps ?? 0) + 1;
  let interval: number;
  if (reps === 1) interval = grade === "hard" ? 1 : 2;
  else if (reps === 2) interval = grade === "hard" ? 3 : 4;
  else interval = Math.max(1, Math.round((prev?.intervalDays ?? 1) * ease));

  return { reps, ease, intervalDays: interval, due: now + interval * DAY };
}

export const isDue = (r: ReviewState | undefined, now: number): boolean => !!r && r.due <= now;

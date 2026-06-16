// Cliente del proxy de IA (§10). Habla con server/ (que guarda la API key).
// Degrada con elegancia: si no hay proxy configurado (AI_PROXY_URL vacío) o falla,
// devuelve null y la app sigue funcionando (frescura offline, recuperación local).

import { AI_PROXY_URL } from "../lib/env";
import { UserModel } from "../types";

export interface Suggestion {
  title: string;
  why: string;
  intent: string;
  theme: string;
}

export const aiEnabled = () => !!AI_PROXY_URL;

async function postJSON<T>(path: string, body: unknown, timeoutMs = 30000): Promise<T | null> {
  if (!AI_PROXY_URL) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const r = await fetch(AI_PROXY_URL + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null; // offline / timeout / proxy caído → la app no se rompe
  }
}

// Sugerencias proactivas a tu medida (lee tu «Sobre ti» + tus materias).
export async function fetchSuggestions(userModel: UserModel, materias: string[]): Promise<Suggestion[] | null> {
  const j = await postJSON<{ suggestions: Suggestion[] }>("/suggest", { userModel, materias });
  return j?.suggestions ?? null;
}

// Divagar con tu segundo cerebro: tu pregunta + quién eres + lo que ya sabes (RAG).
export async function chatWithBrain(question: string, userModel: UserModel, memory: string[]): Promise<string | null> {
  const j = await postJSON<{ answer: string }>("/chat", { question, userModel, memory });
  return j?.answer ?? null;
}

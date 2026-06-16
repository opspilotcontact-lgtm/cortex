// Persistencia local (AsyncStorage = equivalente RN del localStorage).
// El día que Supabase esté vivo, esta capa se complementa con sync (§4),
// pero la app sigue leyendo de aquí para funcionar offline (bus, metro).

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Capsule, ExperimentState } from "../types";

const KEY = "cortex_phase1_v1";
const CAPS_KEY = "cortex_user_capsules_v1"; // cápsulas generadas por la IA en este dispositivo

export const todayStr = () => new Date().toISOString().slice(0, 10);

export function emptyState(): ExperimentState {
  const today = todayStr();
  return { firstDay: today, byDay: { [today]: 0 }, seen: {}, saved: [], notes: [], events: [], reviews: {}, userModel: { motivations: "", goals: "", interests: "" }, onboarded: false };
}

export async function loadState(): Promise<ExperimentState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return emptyState();
    const s = JSON.parse(raw) as ExperimentState;
    // normalizar por si falta algo
    const base = emptyState();
    const merged: ExperimentState = { ...base, ...s };
    if (!merged.byDay[todayStr()]) merged.byDay[todayStr()] = 0;
    return merged;
  } catch {
    return emptyState();
  }
}

export async function saveState(s: ExperimentState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // offline-first: si falla la escritura no rompemos la UX
  }
}

export async function resetState(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

// ── cápsulas generadas por la IA (se fusionan con el feed; offline-first) ──
export async function loadUserCapsules(): Promise<Capsule[]> {
  try {
    const raw = await AsyncStorage.getItem(CAPS_KEY);
    return raw ? (JSON.parse(raw) as Capsule[]) : [];
  } catch {
    return [];
  }
}

export async function saveUserCapsules(caps: Capsule[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CAPS_KEY, JSON.stringify(caps));
  } catch {
    // offline-first: no rompemos la UX si falla
  }
}

export function daysSinceStart(s: ExperimentState): number {
  return Math.round((new Date(todayStr()).getTime() - new Date(s.firstDay).getTime()) / 86400000);
}

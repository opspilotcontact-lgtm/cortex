// Persistencia local (AsyncStorage = equivalente RN del localStorage).
// El día que Supabase esté vivo, esta capa se complementa con sync (§4),
// pero la app sigue leyendo de aquí para funcionar offline (bus, metro).

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ExperimentState } from "../types";

const KEY = "cortex_phase1_v1";

export const todayStr = () => new Date().toISOString().slice(0, 10);

export function emptyState(): ExperimentState {
  const today = todayStr();
  return { firstDay: today, byDay: { [today]: 0 }, seen: {}, saved: [], notes: [], events: [], reviews: {}, userModel: { motivations: "", goals: "", interests: "" } };
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

export function daysSinceStart(s: ExperimentState): number {
  return Math.round((new Date(todayStr()).getTime() - new Date(s.firstDay).getTime()) / 86400000);
}

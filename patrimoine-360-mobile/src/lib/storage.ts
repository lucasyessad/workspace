import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, ModuleState } from "../types";

const STORAGE_KEY = "patrimoine360_state";

export async function loadState(): Promise<AppState> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { modules: {} };
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export async function saveModuleState(moduleId: number, moduleState: ModuleState): Promise<void> {
  const state = await loadState();
  state.modules[moduleId] = moduleState;
  await saveState(state);
}

export async function clearModuleState(moduleId: number): Promise<void> {
  const state = await loadState();
  delete state.modules[moduleId];
  await saveState(state);
}

export async function getCompletedModules(): Promise<number[]> {
  const state = await loadState();
  return Object.entries(state.modules)
    .filter(([, v]) => v.completed)
    .map(([k]) => Number(k));
}

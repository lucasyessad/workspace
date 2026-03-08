"use client";
import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import OnboardingWizard, { mapOnboardingToModules } from "@/components/OnboardingWizard";
import { OnboardingData, AppState } from "@/types";

function loadState(): AppState {
  try {
    const stored = localStorage.getItem("patrimoine360_state");
    if (stored) return JSON.parse(stored);
  } catch {}
  return { modules: {} };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem("patrimoine360_state", JSON.stringify(state));
  } catch {}
}

export default function HomePage() {
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appState, setAppState] = useState<AppState>({ modules: {} });

  useEffect(() => {
    const state = loadState();
    setAppState(state);
    const completed = Object.entries(state.modules || {})
      .filter(([, v]) => (v as { completed: boolean }).completed)
      .map(([k]) => Number(k));
    setCompletedModules(completed);

    if (!state.onboarding?.completed && Object.keys(state.modules).length === 0) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (data: OnboardingData) => {
    const state = loadState();
    state.onboarding = data;
    const mapped = mapOnboardingToModules(data);
    for (const [moduleId, fields] of Object.entries(mapped)) {
      const id = Number(moduleId);
      if (!state.modules[id]) {
        state.modules[id] = { formData: {}, completed: false };
      }
      state.modules[id].formData = { ...state.modules[id].formData, ...fields };
    }
    saveState(state);
    setAppState(state);
    setShowOnboarding(false);
  };

  const handleSkipOnboarding = () => {
    const state = loadState();
    state.onboarding = { completed: true };
    saveState(state);
    setShowOnboarding(false);
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard onComplete={handleOnboardingComplete} onSkip={handleSkipOnboarding} />
      )}
      <Dashboard completedModules={completedModules} appState={appState} />
    </>
  );
}

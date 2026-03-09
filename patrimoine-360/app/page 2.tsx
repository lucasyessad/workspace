"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import OnboardingWizard, { mapOnboardingToModules } from "@/components/OnboardingWizard";
import { DashboardSkeleton } from "@/components/Skeleton";
import { OnboardingData, AppState } from "@/types";
import { loadAppState, saveAppState } from "@/lib/storage";

const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  loading: () => <DashboardSkeleton />,
});

export default function HomePage() {
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appState, setAppState] = useState<AppState>({ modules: {} });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const state = loadAppState();
    setAppState(state);
    const completed = Object.entries(state.modules || {})
      .filter(([, v]) => (v as { completed: boolean }).completed)
      .map(([k]) => Number(k));
    setCompletedModules(completed);

    if (!state.onboarding?.completed && Object.keys(state.modules).length === 0) {
      setShowOnboarding(true);
    }

    // Enregistrement du service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    setMounted(true);
  }, []);

  const handleOnboardingComplete = (data: OnboardingData) => {
    const state = loadAppState();
    state.onboarding = data;
    const mapped = mapOnboardingToModules(data);
    for (const [moduleId, fields] of Object.entries(mapped)) {
      const id = Number(moduleId);
      if (!state.modules[id]) {
        state.modules[id] = { formData: {}, completed: false };
      }
      state.modules[id].formData = { ...state.modules[id].formData, ...fields };
    }
    saveAppState(state);
    setAppState(state);
    setShowOnboarding(false);
  };

  const handleSkipOnboarding = () => {
    const state = loadAppState();
    state.onboarding = { completed: true };
    saveAppState(state);
    setShowOnboarding(false);
  };

  if (!mounted) return <DashboardSkeleton />;

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard onComplete={handleOnboardingComplete} onSkip={handleSkipOnboarding} />
      )}
      <Dashboard completedModules={completedModules} appState={appState} />
    </>
  );
}

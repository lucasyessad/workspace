"use client";
import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";

export default function HomePage() {
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("patrimoine360_state");
      if (stored) {
        const state = JSON.parse(stored);
        const completed = Object.entries(state.modules || {})
          .filter(([, v]) => (v as { completed: boolean }).completed)
          .map(([k]) => Number(k));
        setCompletedModules(completed);
      }
    } catch {}
  }, []);

  return <Dashboard completedModules={completedModules} />;
}

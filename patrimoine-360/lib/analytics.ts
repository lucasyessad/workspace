// Analytics produit — tracking KPI d'usage
// Stocke les événements localement, prêt pour intégration Supabase/Mixpanel/PostHog

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, string | number | boolean>;
  timestamp: string;
}

const STORAGE_KEY = "patrimoine360_analytics";
const MAX_EVENTS = 500;

function getEvents(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveEvents(events: AnalyticsEvent[]) {
  try {
    // Keep only the last MAX_EVENTS events
    const trimmed = events.slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function trackEvent(event: string, properties?: Record<string, string | number | boolean>) {
  const entry: AnalyticsEvent = {
    event,
    properties,
    timestamp: new Date().toISOString(),
  };

  const events = getEvents();
  events.push(entry);
  saveEvents(events);

  // Console in dev
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", event, properties);
  }
}

// Pre-defined events
export const Events = {
  // Onboarding
  ONBOARDING_START: "onboarding_start",
  ONBOARDING_COMPLETE: "onboarding_complete",
  ONBOARDING_SKIP: "onboarding_skip",

  // Modules
  MODULE_VIEW: "module_view",
  MODULE_FORM_FILL: "module_form_fill",
  MODULE_ANALYSIS_START: "module_analysis_start",
  MODULE_ANALYSIS_COMPLETE: "module_analysis_complete",
  MODULE_ANALYSIS_ERROR: "module_analysis_error",

  // Exports
  EXPORT_PDF: "export_pdf",
  EXPORT_EXCEL: "export_excel",
  EXPORT_BILAN_COMPLET: "export_bilan_complet",

  // Copilote
  COPILOT_MESSAGE_SENT: "copilot_message_sent",
  COPILOT_CONVERSATION_START: "copilot_conversation_start",

  // Objectifs
  OBJECTIVE_CREATE: "objective_create",
  OBJECTIVE_COMPLETE: "objective_complete",
  OBJECTIVE_DELETE: "objective_delete",

  // Navigation
  PAGE_VIEW: "page_view",
  THEME_TOGGLE: "theme_toggle",

  // Score
  SCORE_VIEW: "score_view",

  // Scénarios
  SCENARIO_VIEW: "scenario_view",
} as const;

// Metrics aggregation
export function getAnalyticsSummary(): Record<string, number> {
  const events = getEvents();
  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.event] = (counts[e.event] || 0) + 1;
  }
  return counts;
}

export function getModuleCompletionRate(): number {
  const events = getEvents();
  const completedModules = new Set(
    events
      .filter((e) => e.event === Events.MODULE_ANALYSIS_COMPLETE)
      .map((e) => e.properties?.moduleId)
      .filter(Boolean)
  );
  return (completedModules.size / 12) * 100;
}

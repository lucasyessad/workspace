export type FieldType = "number" | "text" | "textarea" | "select";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: FieldOption[];
  suffix?: string;
}

export interface ModuleDefinition {
  id: number;
  title: string;
  style: string;
  icon: string;
  description: string;
  fields: FormField[];
  hasCalculator: boolean;
}

export interface FormData {
  [key: string]: string | number;
}

export interface CalculationResult {
  label: string;
  value: number | string;
  suffix?: string;
  type?: "score" | "progress" | "metric" | "currency" | "percent";
  max?: number;
  color?: "success" | "warning" | "danger" | "accent";
}

export interface HistoryEntry {
  date: string;
  formData: FormData;
  aiResult?: string;
  calculationResults?: CalculationResult[];
  version?: number;
  modelUsed?: string;
}

export interface ModuleState {
  formData: FormData;
  aiResult?: string;
  completed: boolean;
  calculationResults?: CalculationResult[];
  history?: HistoryEntry[];
}

export interface OnboardingData {
  age?: number;
  revenus_mensuels?: number;
  depenses_mensuelles?: number;
  epargne_totale?: number;
  dettes_totales?: number;
  investissements?: number;
  revenus_annuels?: number;
  statut_fiscal?: string;
  lieu_residence?: string;
  completed: boolean;
}

export interface UserProfile {
  age?: number;
  revenus_mensuels?: number;
  depenses_mensuelles?: number;
  epargne_totale?: number;
  dettes_totales?: number;
  investissements?: number;
  revenus_annuels?: number;
  capacite_epargne?: number;
  statut_fiscal?: string;
  lieu_residence?: string;
  nom?: string;
  email?: string;
}

export type Theme = "dark" | "light";

export interface AppState {
  modules: { [moduleId: number]: ModuleState };
  onboarding?: OnboardingData;
  theme?: Theme;
}

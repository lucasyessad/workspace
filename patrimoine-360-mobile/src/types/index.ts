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

export interface ModuleState {
  formData: FormData;
  aiResult?: string;
  completed: boolean;
}

export interface AppState {
  modules: { [moduleId: number]: ModuleState };
}

export type RootStackParamList = {
  Dashboard: undefined;
  Module: { id: number };
};

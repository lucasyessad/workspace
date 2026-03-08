export interface Organization {
  id: string;
  name: string;
  slug: string;
  organization_type: string;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  status: string;
  role?: "admin" | "user";
  organization_id: string;
  created_at: string;
}

export interface BuildingProject {
  id: string;
  organization_id: string;
  name: string;
  project_code?: string;
  project_status: string;
  workflow_stage?: string;
  client_reference?: string;
  description?: string;
  calculation_method?: string;
  climate_zone?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  created_at: string;
}

export interface Building {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  address_line_1?: string;
  postal_code?: string;
  city?: string;
  construction_year?: number;
  building_type?: string;
  heated_area_m2?: number;
  floors_above_ground?: number;
  current_energy_label?: string;
  current_ghg_label?: string;
  created_at: string;
}

export interface System {
  id: string;
  building_id: string;
  system_type: string;
  energy_source?: string;
  brand?: string;
  installation_year?: number;
  nominal_power_kw?: number;
  efficiency_nominal?: number;
}

export interface Envelope {
  id: string;
  building_id: string;
  element_type: string;
  orientation?: string;
  surface_m2?: number;
  u_value?: number;
  insulation_type?: string;
  condition_state?: string;
}

export interface Audit {
  id: string;
  organization_id: string;
  project_id: string;
  building_id: string;
  audit_type: string;
  version_number: number;
  status: string;
  baseline_energy_consumption_kwh?: number;
  baseline_energy_cost_eur?: number;
  baseline_co2_kg?: number;
  computed_energy_label?: string;
  computed_ghg_label?: string;
  result_snapshot?: AuditResult;
  created_at: string;
  updated_at: string;
}

export interface AuditResult {
  energy_label: string;
  ghg_label: string;
  primary_energy_per_m2: number;
  co2_per_m2: number;
  heating_kwh: number;
  ecs_kwh: number;
  ventilation_kwh: number;
  total_final_kwh: number;
  estimated_annual_cost_eur: number;
  details?: Record<string, unknown>;
}

export interface RenovationScenario {
  id: string;
  organization_id: string;
  audit_id: string;
  name: string;
  scenario_type: string;
  status: string;
  target_energy_label?: string;
  estimated_total_cost_eur?: number;
  estimated_annual_savings_eur?: number;
  estimated_energy_savings_kwh?: number;
  estimated_co2_reduction_kg?: number;
  simple_payback_years?: number;
  created_at: string;
}

export interface SimulationResult {
  measure_type: string;
  energy_savings_kwh: number;
  energy_savings_percent: number;
  co2_savings_kg: number;
  estimated_cost_eur: number;
  simple_payback_years: number;
  new_energy_label: string;
  new_ghg_label: string;
  new_primary_energy_per_m2: number;
}

export interface GeneratedReport {
  id: string;
  organization_id: string;
  audit_id?: string;
  scenario_id?: string;
  report_type: string;
  status: string;
  file_path?: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  full_key?: string;
}

export interface SubscriptionPlan {
  id: string;
  label: string;
  monthly_eur: number;
  limits: { audits_per_month: number; api_keys: number; team_members: number };
  features: string[];
}

export interface MLResult {
  predicted_primary_energy_per_m2: number;
  model_mae_kwh_m2: number;
  top_influencing_factors: { feature: string; importance: number }[];
  calculator_primary_energy_per_m2?: number;
  delta_kwh_m2?: number;
  delta_percent?: number;
  note?: string;
}

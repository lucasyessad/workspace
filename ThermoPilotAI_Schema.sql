-- =============================================================================
-- ThermoPilot AI — PostgreSQL 16 DDL
-- Version : 1.0.0
-- Generated from : ThermoPilotAI_SchemaSQL_IA.yaml
-- =============================================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- DOMAIN 12 — Référentiels métier (no FK dependencies)
-- =============================================================================

CREATE TABLE ref_energy_types (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(40) NOT NULL UNIQUE,
    label       VARCHAR(120) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ref_system_types (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(40) NOT NULL UNIQUE,
    label       VARCHAR(120) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ref_measure_types (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(40) NOT NULL UNIQUE,
    label       VARCHAR(120) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ref_document_types (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(40) NOT NULL UNIQUE,
    label       VARCHAR(120) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ref_task_statuses (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(40) NOT NULL UNIQUE,
    label       VARCHAR(120) NOT NULL,
    is_terminal BOOLEAN     NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ref_priorities (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(40) NOT NULL UNIQUE,
    label       VARCHAR(120) NOT NULL,
    sort_order  INTEGER     NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- DOMAIN 1 — Identité et sécurité
-- =============================================================================

CREATE TABLE organizations (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(120) NOT NULL UNIQUE,
    organization_type   VARCHAR(50)  NOT NULL,
    billing_email       VARCHAR(255),
    country_code        VARCHAR(2),
    timezone            VARCHAR(64)  NOT NULL DEFAULT 'Europe/Paris',
    is_active           BOOLEAN      NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_organizations_slug ON organizations (slug);

-- ----------------------------------------------------------------------------

CREATE TABLE users (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password_hash       TEXT,
    first_name          VARCHAR(120),
    last_name           VARCHAR(120),
    job_title           VARCHAR(255),
    phone               VARCHAR(50),
    status              VARCHAR(50)  NOT NULL DEFAULT 'active',
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_org_status ON users (organization_id, status);

-- ----------------------------------------------------------------------------

CREATE TABLE roles (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(80) NOT NULL UNIQUE,
    name        VARCHAR(120) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------

CREATE TABLE user_roles (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role_id     UUID        NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role_id)
);

-- ----------------------------------------------------------------------------

CREATE TABLE api_keys (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    key_prefix          VARCHAR(20)  NOT NULL,
    key_hash            TEXT         NOT NULL,
    scopes              JSONB        NOT NULL DEFAULT '[]',
    last_used_at        TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ,
    revoked_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_keys_org ON api_keys (organization_id);

-- =============================================================================
-- DOMAIN 2 — Organisations et abonnements
-- =============================================================================

CREATE TABLE subscription_plans (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    code                VARCHAR(80)     NOT NULL UNIQUE,
    name                VARCHAR(120)    NOT NULL,
    monthly_price_eur   NUMERIC(12,2)   NOT NULL,
    yearly_price_eur    NUMERIC(12,2),
    features            JSONB           NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------

CREATE TABLE subscriptions (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    plan_id                 UUID        NOT NULL REFERENCES subscription_plans (id),
    status                  VARCHAR(50) NOT NULL,
    starts_at               TIMESTAMPTZ NOT NULL,
    ends_at                 TIMESTAMPTZ,
    billing_cycle           VARCHAR(20) NOT NULL,
    max_users               INTEGER,
    max_projects            INTEGER,
    max_monthly_audits      INTEGER,
    features                JSONB       NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_org_status ON subscriptions (organization_id, status);

-- ----------------------------------------------------------------------------

CREATE TABLE usage_counters (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    metric_code         VARCHAR(80) NOT NULL,
    period_start        DATE        NOT NULL,
    period_end          DATE        NOT NULL,
    value_numeric       NUMERIC(18,4) NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, metric_code, period_start, period_end)
);

-- =============================================================================
-- DOMAIN 3 — Gestion des bâtiments
-- =============================================================================

CREATE TABLE building_projects (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    project_code            VARCHAR(80),
    name                    VARCHAR(255) NOT NULL,
    project_status          VARCHAR(50)  NOT NULL,
    client_reference        VARCHAR(120),
    primary_manager_user_id UUID        REFERENCES users (id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, project_code)
);

CREATE INDEX idx_building_projects_org_status ON building_projects (organization_id, project_status);

-- ----------------------------------------------------------------------------

CREATE TABLE buildings (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID            NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    project_id              UUID            NOT NULL REFERENCES building_projects (id) ON DELETE CASCADE,
    name                    VARCHAR(255)    NOT NULL,
    address_line_1          VARCHAR(255),
    address_line_2          VARCHAR(255),
    postal_code             VARCHAR(20),
    city                    VARCHAR(120),
    country_code            VARCHAR(2),
    latitude                NUMERIC(9,6),
    longitude               NUMERIC(9,6),
    construction_year       INTEGER,
    building_type           VARCHAR(80),
    ownership_type          VARCHAR(80),
    heated_area_m2          NUMERIC(14,2),
    floors_above_ground     INTEGER,
    floors_below_ground     INTEGER,
    main_use_type           VARCHAR(80),
    occupancy_profile       VARCHAR(80),
    current_energy_label    VARCHAR(4),
    current_ghg_label       VARCHAR(4),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_buildings_org_city ON buildings (organization_id, city);
CREATE INDEX idx_buildings_project ON buildings (project_id);
CREATE INDEX idx_buildings_postal_code ON buildings (postal_code);

-- ----------------------------------------------------------------------------

CREATE TABLE building_blocks (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID        NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    block_type  VARCHAR(50),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_building_blocks_building ON building_blocks (building_id);

-- ----------------------------------------------------------------------------

CREATE TABLE building_zones (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id     UUID            NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
    block_id        UUID            REFERENCES building_blocks (id) ON DELETE SET NULL,
    name            VARCHAR(255)    NOT NULL,
    zone_type       VARCHAR(80),
    heated_area_m2  NUMERIC(14,2),
    volume_m3       NUMERIC(14,2),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_building_zones_building ON building_zones (building_id);

-- ----------------------------------------------------------------------------

CREATE TABLE units (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id     UUID        NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
    zone_id         UUID        REFERENCES building_zones (id) ON DELETE SET NULL,
    lot_number      VARCHAR(80),
    unit_type       VARCHAR(80),
    floor_label     VARCHAR(50),
    area_m2         NUMERIC(14,2),
    occupancy_type  VARCHAR(80),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_units_building ON units (building_id);

-- ----------------------------------------------------------------------------

CREATE TABLE systems (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id         UUID        NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
    zone_id             UUID        REFERENCES building_zones (id) ON DELETE SET NULL,
    system_type         VARCHAR(80) NOT NULL,
    energy_source       VARCHAR(80),
    brand               VARCHAR(120),
    model               VARCHAR(120),
    installation_year   INTEGER,
    nominal_power_kw    NUMERIC(14,3),
    efficiency_nominal  NUMERIC(8,4),
    status              VARCHAR(50),
    metadata            JSONB       NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_systems_building_type ON systems (building_id, system_type);
CREATE INDEX idx_systems_metadata ON systems USING GIN (metadata);

-- ----------------------------------------------------------------------------

CREATE TABLE envelopes (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id             UUID        NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
    zone_id                 UUID        REFERENCES building_zones (id) ON DELETE SET NULL,
    element_type            VARCHAR(80) NOT NULL,
    orientation             VARCHAR(20),
    surface_m2              NUMERIC(14,2),
    u_value                 NUMERIC(8,4),
    insulation_type         VARCHAR(120),
    insulation_thickness_mm NUMERIC(10,2),
    condition_state         VARCHAR(50),
    metadata                JSONB       NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_envelopes_building_type ON envelopes (building_id, element_type);
CREATE INDEX idx_envelopes_metadata ON envelopes USING GIN (metadata);

-- ----------------------------------------------------------------------------

CREATE TABLE metering_points (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id     UUID        NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
    energy_type     VARCHAR(80) NOT NULL,
    meter_reference VARCHAR(120),
    provider_name   VARCHAR(255),
    unit            VARCHAR(20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_metering_points_building ON metering_points (building_id);

-- ----------------------------------------------------------------------------

CREATE TABLE energy_bills (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id             UUID            NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
    metering_point_id       UUID            REFERENCES metering_points (id) ON DELETE SET NULL,
    billing_period_start    DATE            NOT NULL,
    billing_period_end      DATE            NOT NULL,
    energy_type             VARCHAR(80)     NOT NULL,
    consumption_kwh         NUMERIC(18,3),
    cost_eur_ht             NUMERIC(14,2),
    cost_eur_ttc            NUMERIC(14,2),
    degree_days_base        NUMERIC(10,2),
    supplier_name           VARCHAR(255),
    invoice_reference       VARCHAR(120),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_energy_bills_building_period ON energy_bills (building_id, billing_period_start, billing_period_end);

-- =============================================================================
-- DOMAIN 4 — Documents et médias
-- =============================================================================

CREATE TABLE files (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    storage_provider        VARCHAR(50) NOT NULL,
    storage_bucket          VARCHAR(255) NOT NULL,
    storage_key             TEXT        NOT NULL,
    original_filename       VARCHAR(255) NOT NULL,
    mime_type               VARCHAR(150) NOT NULL,
    file_size_bytes         BIGINT      NOT NULL,
    checksum_sha256         CHAR(64),
    uploaded_by_user_id     UUID        REFERENCES users (id) ON DELETE SET NULL,
    uploaded_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (storage_bucket, storage_key)
);

CREATE INDEX idx_files_org ON files (organization_id);

-- ----------------------------------------------------------------------------

CREATE TABLE file_links (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id             UUID        NOT NULL REFERENCES files (id) ON DELETE CASCADE,
    linked_entity_type  VARCHAR(80) NOT NULL,
    linked_entity_id    UUID        NOT NULL,
    link_role           VARCHAR(80),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_file_links_file ON file_links (file_id);
CREATE INDEX idx_file_links_entity ON file_links (linked_entity_type, linked_entity_id);

-- ----------------------------------------------------------------------------

CREATE TABLE document_extractions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id             UUID        NOT NULL REFERENCES files (id) ON DELETE CASCADE,
    extraction_type     VARCHAR(80) NOT NULL,
    engine_name         VARCHAR(120),
    engine_version      VARCHAR(80),
    status              VARCHAR(50) NOT NULL,
    raw_text            TEXT,
    structured_data     JSONB       NOT NULL DEFAULT '{}',
    confidence_score    NUMERIC(5,4),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_extractions_file ON document_extractions (file_id, extraction_type);
CREATE INDEX idx_document_extractions_structured ON document_extractions USING GIN (structured_data);

-- ----------------------------------------------------------------------------

CREATE TABLE site_photos (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id     UUID        NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
    file_id         UUID        NOT NULL REFERENCES files (id) ON DELETE CASCADE,
    photo_category  VARCHAR(80),
    taken_at        TIMESTAMPTZ,
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_photos_building ON site_photos (building_id);

-- =============================================================================
-- DOMAIN 5 — Audits énergétiques
-- =============================================================================

CREATE TABLE audits (
    id                              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id                 UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    project_id                      UUID        NOT NULL REFERENCES building_projects (id) ON DELETE CASCADE,
    building_id                     UUID        NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
    audit_type                      VARCHAR(80) NOT NULL,
    version_number                  INTEGER     NOT NULL DEFAULT 1,
    status                          VARCHAR(50) NOT NULL,
    initiated_by_user_id            UUID        REFERENCES users (id) ON DELETE SET NULL,
    validated_by_user_id            UUID        REFERENCES users (id) ON DELETE SET NULL,
    reference_period_start          DATE,
    reference_period_end            DATE,
    weather_normalization_method    VARCHAR(80),
    baseline_energy_consumption_kwh NUMERIC(18,3),
    baseline_energy_cost_eur        NUMERIC(14,2),
    baseline_co2_kg                 NUMERIC(18,3),
    computed_energy_label           VARCHAR(4),
    computed_ghg_label              VARCHAR(4),
    assumptions                     JSONB       NOT NULL DEFAULT '{}',
    input_snapshot                  JSONB       NOT NULL DEFAULT '{}',
    result_snapshot                 JSONB       NOT NULL DEFAULT '{}',
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audits_building_created ON audits (building_id, created_at DESC);
CREATE INDEX idx_audits_org_status ON audits (organization_id, status);
CREATE INDEX idx_audits_assumptions ON audits USING GIN (assumptions);

-- ----------------------------------------------------------------------------

CREATE TABLE audit_inputs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id            UUID        NOT NULL REFERENCES audits (id) ON DELETE CASCADE,
    input_group         VARCHAR(80) NOT NULL,
    input_key           VARCHAR(120) NOT NULL,
    input_value_text    TEXT,
    input_value_numeric NUMERIC(18,6),
    input_value_bool    BOOLEAN,
    unit                VARCHAR(30),
    source_type         VARCHAR(80),
    source_reference    VARCHAR(255),
    confidence_score    NUMERIC(5,4),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_inputs_audit_group ON audit_inputs (audit_id, input_group);
CREATE INDEX idx_audit_inputs_audit_key ON audit_inputs (audit_id, input_key);

-- ----------------------------------------------------------------------------

CREATE TABLE audit_observations (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id            UUID        NOT NULL REFERENCES audits (id) ON DELETE CASCADE,
    category            VARCHAR(80) NOT NULL,
    severity            VARCHAR(50),
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    location_label      VARCHAR(255),
    related_photo_id    UUID        REFERENCES site_photos (id) ON DELETE SET NULL,
    created_by_user_id  UUID        REFERENCES users (id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_observations_audit ON audit_observations (audit_id);

-- ----------------------------------------------------------------------------

CREATE TABLE audit_issues (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id            UUID        NOT NULL REFERENCES audits (id) ON DELETE CASCADE,
    issue_code          VARCHAR(80) NOT NULL,
    severity            VARCHAR(50) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    status              VARCHAR(50) NOT NULL,
    resolution_notes    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_issues_audit_status ON audit_issues (audit_id, status);

-- ----------------------------------------------------------------------------

CREATE TABLE audit_versions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id            UUID        NOT NULL REFERENCES audits (id) ON DELETE CASCADE,
    version_number      INTEGER     NOT NULL,
    snapshot_payload    JSONB       NOT NULL,
    created_by_user_id  UUID        REFERENCES users (id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (audit_id, version_number)
);

CREATE INDEX idx_audit_versions_audit ON audit_versions (audit_id);

-- =============================================================================
-- DOMAIN 6 — Calculs et moteurs d'analyse
-- =============================================================================

CREATE TABLE calculation_runs (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    audit_id                UUID        NOT NULL REFERENCES audits (id) ON DELETE CASCADE,
    calculation_type        VARCHAR(80) NOT NULL,
    engine_name             VARCHAR(120) NOT NULL,
    engine_version          VARCHAR(80),
    status                  VARCHAR(50) NOT NULL,
    started_at              TIMESTAMPTZ,
    finished_at             TIMESTAMPTZ,
    requested_by_user_id    UUID        REFERENCES users (id) ON DELETE SET NULL,
    input_payload           JSONB       NOT NULL DEFAULT '{}',
    output_payload          JSONB       NOT NULL DEFAULT '{}',
    logs_excerpt            TEXT,
    error_code              VARCHAR(80),
    error_message           TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calculation_runs_audit_status ON calculation_runs (audit_id, status);
CREATE INDEX idx_calculation_runs_input ON calculation_runs USING GIN (input_payload);
CREATE INDEX idx_calculation_runs_output ON calculation_runs USING GIN (output_payload);

-- ----------------------------------------------------------------------------

CREATE TABLE calculation_metrics (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    calculation_run_id  UUID        NOT NULL REFERENCES calculation_runs (id) ON DELETE CASCADE,
    metric_code         VARCHAR(80) NOT NULL,
    metric_value        NUMERIC(18,6),
    unit                VARCHAR(30),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (calculation_run_id, metric_code)
);

CREATE INDEX idx_calculation_metrics_run ON calculation_metrics (calculation_run_id);

-- ----------------------------------------------------------------------------

CREATE TABLE ai_analysis_runs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    audit_id            UUID        REFERENCES audits (id) ON DELETE SET NULL,
    file_id             UUID        REFERENCES files (id) ON DELETE SET NULL,
    analysis_type       VARCHAR(80) NOT NULL,
    model_name          VARCHAR(120) NOT NULL,
    model_version       VARCHAR(80),
    status              VARCHAR(50) NOT NULL,
    input_payload       JSONB       NOT NULL DEFAULT '{}',
    output_payload      JSONB       NOT NULL DEFAULT '{}',
    confidence_score    NUMERIC(5,4),
    started_at          TIMESTAMPTZ,
    finished_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_analysis_runs_org ON ai_analysis_runs (organization_id);
CREATE INDEX idx_ai_analysis_runs_audit ON ai_analysis_runs (audit_id);

-- ----------------------------------------------------------------------------

CREATE TABLE ai_analysis_outputs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_analysis_run_id  UUID        NOT NULL REFERENCES ai_analysis_runs (id) ON DELETE CASCADE,
    output_key          VARCHAR(120) NOT NULL,
    output_value_text   TEXT,
    output_value_numeric NUMERIC(18,6),
    output_payload      JSONB       NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_analysis_outputs_run ON ai_analysis_outputs (ai_analysis_run_id);

-- =============================================================================
-- DOMAIN 7 — Scénarios de rénovation
-- =============================================================================

CREATE TABLE renovation_scenarios (
    id                          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id             UUID            NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    audit_id                    UUID            NOT NULL REFERENCES audits (id) ON DELETE CASCADE,
    name                        VARCHAR(255)    NOT NULL,
    scenario_type               VARCHAR(80)     NOT NULL,
    status                      VARCHAR(50)     NOT NULL,
    target_energy_label         VARCHAR(4),
    target_ghg_label            VARCHAR(4),
    estimated_total_cost_eur    NUMERIC(14,2),
    estimated_annual_savings_eur NUMERIC(14,2),
    estimated_energy_savings_kwh NUMERIC(18,3),
    estimated_co2_reduction_kg  NUMERIC(18,3),
    simple_payback_years        NUMERIC(10,2),
    priority_score              NUMERIC(10,4),
    notes                       TEXT,
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_renovation_scenarios_audit_status ON renovation_scenarios (audit_id, status);

-- ----------------------------------------------------------------------------

CREATE TABLE renovation_measures (
    id                          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id             UUID            NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    measure_type                VARCHAR(80)     NOT NULL,
    component_scope             VARCHAR(120),
    description                 TEXT,
    quantity                    NUMERIC(14,3),
    unit                        VARCHAR(30),
    estimated_unit_cost_eur     NUMERIC(14,2),
    estimated_total_cost_eur    NUMERIC(14,2),
    expected_energy_gain_kwh    NUMERIC(18,3),
    expected_co2_gain_kg        NUMERIC(18,3),
    expected_maintenance_impact VARCHAR(80),
    execution_complexity        VARCHAR(50),
    phasing_group               VARCHAR(80),
    metadata                    JSONB           NOT NULL DEFAULT '{}',
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_renovation_measures_org ON renovation_measures (organization_id);

-- ----------------------------------------------------------------------------

CREATE TABLE scenario_measure_links (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id     UUID        NOT NULL REFERENCES renovation_scenarios (id) ON DELETE CASCADE,
    measure_id      UUID        NOT NULL REFERENCES renovation_measures (id) ON DELETE CASCADE,
    sequence_order  INTEGER,
    is_mandatory    BOOLEAN     NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (scenario_id, measure_id)
);

-- ----------------------------------------------------------------------------

CREATE TABLE financial_aids (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID        REFERENCES organizations (id) ON DELETE SET NULL,
    aid_code            VARCHAR(80) NOT NULL,
    aid_name            VARCHAR(255) NOT NULL,
    aid_type            VARCHAR(80),
    eligibility_rules   JSONB       NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------

CREATE TABLE scenario_financials (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id         UUID        NOT NULL REFERENCES renovation_scenarios (id) ON DELETE CASCADE,
    total_cost_eur      NUMERIC(14,2),
    total_aids_eur      NUMERIC(14,2),
    net_cost_eur        NUMERIC(14,2),
    annual_savings_eur  NUMERIC(14,2),
    payback_years       NUMERIC(10,2),
    npv_eur             NUMERIC(14,2),
    irr_percent         NUMERIC(10,4),
    assumptions         JSONB       NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (scenario_id)
);

-- =============================================================================
-- DOMAIN 8 — Rapports générés
-- =============================================================================

CREATE TABLE report_templates (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID        REFERENCES organizations (id) ON DELETE SET NULL,
    template_code   VARCHAR(80) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    report_type     VARCHAR(80) NOT NULL,
    template_payload JSONB      NOT NULL DEFAULT '{}',
    is_active       BOOLEAN     NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_report_templates_type_active ON report_templates (report_type, is_active);

-- ----------------------------------------------------------------------------

CREATE TABLE generated_reports (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    audit_id                UUID        REFERENCES audits (id) ON DELETE SET NULL,
    scenario_id             UUID        REFERENCES renovation_scenarios (id) ON DELETE SET NULL,
    template_id             UUID        REFERENCES report_templates (id) ON DELETE SET NULL,
    report_type             VARCHAR(80) NOT NULL,
    version_number          INTEGER     NOT NULL DEFAULT 1,
    status                  VARCHAR(50) NOT NULL,
    language_code           VARCHAR(10) NOT NULL DEFAULT 'fr',
    generated_by_user_id    UUID        REFERENCES users (id) ON DELETE SET NULL,
    generation_context      JSONB       NOT NULL DEFAULT '{}',
    file_id                 UUID        REFERENCES files (id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_generated_reports_audit_type ON generated_reports (audit_id, report_type);
CREATE INDEX idx_generated_reports_scenario ON generated_reports (scenario_id);

-- ----------------------------------------------------------------------------

CREATE TABLE report_sections (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id           UUID        NOT NULL REFERENCES generated_reports (id) ON DELETE CASCADE,
    section_code        VARCHAR(80) NOT NULL,
    title               VARCHAR(255),
    content_markdown    TEXT,
    sort_order          INTEGER     NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (report_id, section_code)
);

-- ----------------------------------------------------------------------------

CREATE TABLE report_generation_logs (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id   UUID        NOT NULL REFERENCES generated_reports (id) ON DELETE CASCADE,
    log_level   VARCHAR(20) NOT NULL,
    message     TEXT        NOT NULL,
    payload     JSONB       NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_report_generation_logs_report ON report_generation_logs (report_id);

-- =============================================================================
-- DOMAIN 9 — Backlog produit et tâches
-- =============================================================================

CREATE TABLE workspaces (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    workspace_type  VARCHAR(80) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workspaces_org ON workspaces (organization_id);

-- ----------------------------------------------------------------------------

CREATE TABLE epics (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    workspace_id    UUID        NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    code            VARCHAR(80),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(50) NOT NULL,
    priority        VARCHAR(30) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_epics_workspace_status ON epics (workspace_id, status);

-- ----------------------------------------------------------------------------

CREATE TABLE features (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    epic_id         UUID        NOT NULL REFERENCES epics (id) ON DELETE CASCADE,
    code            VARCHAR(80),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(50) NOT NULL,
    priority        VARCHAR(30) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_features_epic_status ON features (epic_id, status);

-- ----------------------------------------------------------------------------

CREATE TABLE tasks (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    workspace_id        UUID        NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    epic_id             UUID        REFERENCES epics (id) ON DELETE SET NULL,
    feature_id          UUID        REFERENCES features (id) ON DELETE SET NULL,
    parent_task_id      UUID        REFERENCES tasks (id) ON DELETE SET NULL,
    related_entity_type VARCHAR(80),
    related_entity_id   UUID,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    task_type           VARCHAR(80) NOT NULL,
    priority            VARCHAR(30) NOT NULL,
    status              VARCHAR(50) NOT NULL,
    assignee_user_id    UUID        REFERENCES users (id) ON DELETE SET NULL,
    assignee_agent_type VARCHAR(80),
    created_by_user_id  UUID        REFERENCES users (id) ON DELETE SET NULL,
    estimated_hours     NUMERIC(10,2),
    actual_hours        NUMERIC(10,2),
    due_date            DATE,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    next_action         TEXT,
    definition_of_done  TEXT,
    acceptance_criteria JSONB       NOT NULL DEFAULT '[]',
    tags                JSONB       NOT NULL DEFAULT '[]',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_workspace_status_priority ON tasks (workspace_id, status, priority);
CREATE INDEX idx_tasks_related_entity ON tasks (related_entity_type, related_entity_id);
CREATE INDEX idx_tasks_tags ON tasks USING GIN (tags);
CREATE INDEX idx_tasks_parent ON tasks (parent_task_id);

-- ----------------------------------------------------------------------------

CREATE TABLE task_dependencies (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id             UUID        NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    depends_on_task_id  UUID        NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    dependency_type     VARCHAR(50) NOT NULL DEFAULT 'blocks',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (task_id, depends_on_task_id)
);

CREATE INDEX idx_task_dependencies_task ON task_dependencies (task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies (depends_on_task_id);

-- ----------------------------------------------------------------------------

CREATE TABLE task_comments (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id             UUID        NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    author_user_id      UUID        REFERENCES users (id) ON DELETE SET NULL,
    author_agent_type   VARCHAR(80),
    comment_body        TEXT        NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_comments_task ON task_comments (task_id);

-- ----------------------------------------------------------------------------

CREATE TABLE task_checklists (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id     UUID        NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    item_label  VARCHAR(255) NOT NULL,
    is_done     BOOLEAN     NOT NULL DEFAULT false,
    sort_order  INTEGER     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_checklists_task ON task_checklists (task_id);

-- ----------------------------------------------------------------------------

CREATE TABLE task_artifacts (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id         UUID        NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    artifact_type   VARCHAR(80) NOT NULL,
    artifact_label  VARCHAR(255) NOT NULL,
    file_id         UUID        REFERENCES files (id) ON DELETE SET NULL,
    artifact_uri    TEXT,
    metadata        JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_artifacts_task_type ON task_artifacts (task_id, artifact_type);

-- =============================================================================
-- DOMAIN 10 — Historique, journalisation et snapshots
-- =============================================================================

CREATE TABLE activity_logs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    actor_user_id       UUID        REFERENCES users (id) ON DELETE SET NULL,
    actor_agent_type    VARCHAR(80),
    action_code         VARCHAR(120) NOT NULL,
    entity_type         VARCHAR(80),
    entity_id           UUID,
    payload             JSONB       NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_org_created ON activity_logs (organization_id, created_at DESC);
CREATE INDEX idx_activity_logs_entity ON activity_logs (entity_type, entity_id);

-- ----------------------------------------------------------------------------

CREATE TABLE entity_change_log (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type         VARCHAR(80) NOT NULL,
    entity_id           UUID        NOT NULL,
    change_type         VARCHAR(50) NOT NULL,
    before_data         JSONB,
    after_data          JSONB,
    changed_by_user_id  UUID        REFERENCES users (id) ON DELETE SET NULL,
    changed_by_agent    VARCHAR(80),
    changed_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entity_change_log_entity ON entity_change_log (entity_type, entity_id, changed_at DESC);
CREATE INDEX idx_entity_change_log_after ON entity_change_log USING GIN (after_data);

-- ----------------------------------------------------------------------------

CREATE TABLE task_status_history (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id                 UUID        NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    previous_status         VARCHAR(50),
    new_status              VARCHAR(50) NOT NULL,
    changed_by_user_id      UUID        REFERENCES users (id) ON DELETE SET NULL,
    changed_by_agent_type   VARCHAR(80),
    change_reason           TEXT,
    changed_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_status_history_task ON task_status_history (task_id, changed_at DESC);

-- ----------------------------------------------------------------------------

CREATE TABLE task_session_snapshots (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id             UUID        NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    snapshot_label      VARCHAR(255) NOT NULL,
    summary_completed   TEXT,
    summary_remaining   TEXT,
    open_questions      TEXT,
    resume_instructions TEXT,
    context_payload     JSONB       NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_session_snapshots_task ON task_session_snapshots (task_id, created_at DESC);
CREATE INDEX idx_task_session_snapshots_context ON task_session_snapshots USING GIN (context_payload);

-- ----------------------------------------------------------------------------

CREATE TABLE checkpoints (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    workspace_id    UUID        REFERENCES workspaces (id) ON DELETE SET NULL,
    project_id      UUID        REFERENCES building_projects (id) ON DELETE SET NULL,
    checkpoint_label VARCHAR(255) NOT NULL,
    status_summary  TEXT,
    payload         JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_checkpoints_org ON checkpoints (organization_id);

-- =============================================================================
-- DOMAIN 11 — Intégrations et automatisations
-- =============================================================================

CREATE TABLE integrations (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    integration_type    VARCHAR(80) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    status              VARCHAR(50) NOT NULL,
    config_public       JSONB       NOT NULL DEFAULT '{}',
    config_secret_ref   VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_integrations_org ON integrations (organization_id);

-- ----------------------------------------------------------------------------

CREATE TABLE webhooks (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    direction       VARCHAR(20) NOT NULL,
    event_code      VARCHAR(120) NOT NULL,
    target_url      TEXT,
    secret_ref      VARCHAR(255),
    status          VARCHAR(50) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhooks_org ON webhooks (organization_id);

-- ----------------------------------------------------------------------------

CREATE TABLE automation_workflows (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    workflow_type   VARCHAR(80) NOT NULL,
    status          VARCHAR(50) NOT NULL,
    trigger_config  JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_automation_workflows_org ON automation_workflows (organization_id);

-- ----------------------------------------------------------------------------

CREATE TABLE workflow_runs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id     UUID        NOT NULL REFERENCES automation_workflows (id) ON DELETE CASCADE,
    status          VARCHAR(50) NOT NULL,
    started_at      TIMESTAMPTZ,
    finished_at     TIMESTAMPTZ,
    input_payload   JSONB       NOT NULL DEFAULT '{}',
    output_payload  JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_runs_workflow ON workflow_runs (workflow_id, status);

-- ----------------------------------------------------------------------------

CREATE TABLE workflow_steps (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID        NOT NULL REFERENCES automation_workflows (id) ON DELETE CASCADE,
    step_code   VARCHAR(80) NOT NULL,
    step_type   VARCHAR(80) NOT NULL,
    sort_order  INTEGER     NOT NULL,
    config      JSONB       NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (workflow_id, step_code)
);

-- ----------------------------------------------------------------------------

CREATE TABLE workflow_step_runs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_run_id     UUID        NOT NULL REFERENCES workflow_runs (id) ON DELETE CASCADE,
    workflow_step_id    UUID        NOT NULL REFERENCES workflow_steps (id) ON DELETE CASCADE,
    status              VARCHAR(50) NOT NULL,
    started_at          TIMESTAMPTZ,
    finished_at         TIMESTAMPTZ,
    input_payload       JSONB       NOT NULL DEFAULT '{}',
    output_payload      JSONB       NOT NULL DEFAULT '{}',
    error_payload       JSONB       NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_step_runs_run ON workflow_step_runs (workflow_run_id);

-- ----------------------------------------------------------------------------
-- execution_runs — déclaré après workflow_runs pour éviter la référence circulaire.
-- workflow_run_id est stocké comme UUID simple (pas de FK) car le lien est optionnel
-- et peut pointer vers d'autres systèmes d'orchestration.

CREATE TABLE execution_runs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    task_id             UUID        REFERENCES tasks (id) ON DELETE SET NULL,
    workflow_run_id     UUID,   -- référence souple vers workflow_runs.id
    run_type            VARCHAR(80) NOT NULL,
    status              VARCHAR(50) NOT NULL,
    started_at          TIMESTAMPTZ,
    finished_at         TIMESTAMPTZ,
    input_payload       JSONB       NOT NULL DEFAULT '{}',
    output_payload      JSONB       NOT NULL DEFAULT '{}',
    error_payload       JSONB       NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_execution_runs_org ON execution_runs (organization_id);
CREATE INDEX idx_execution_runs_task ON execution_runs (task_id);
CREATE INDEX idx_execution_runs_workflow_run ON execution_runs (workflow_run_id);

-- =============================================================================
-- SEED DATA — Référentiels de base
-- =============================================================================

INSERT INTO ref_energy_types (code, label) VALUES
    ('ELEC',   'Électricité'),
    ('GAZ',    'Gaz naturel'),
    ('FIOUL',  'Fioul domestique'),
    ('RCU',    'Réseau de chaleur urbain'),
    ('BOIS',   'Bois / biomasse'),
    ('GLP',    'GPL / propane'),
    ('CHARBON','Charbon');

INSERT INTO ref_system_types (code, label) VALUES
    ('CHAUFFAGE', 'Chauffage'),
    ('ECS',       'Eau chaude sanitaire'),
    ('VENTILATION','Ventilation'),
    ('CLIM',      'Refroidissement / climatisation'),
    ('PV',        'Photovoltaïque');

INSERT INTO ref_measure_types (code, label) VALUES
    ('ITE',          'Isolation thermique par l'extérieur'),
    ('ITI',          'Isolation thermique par l'intérieur'),
    ('TOITURE',      'Isolation toiture / combles'),
    ('PLANCHER_BAS', 'Isolation plancher bas'),
    ('MENUISERIES',  'Remplacement menuiseries'),
    ('CHAUDIERE',    'Remplacement chaudière'),
    ('PAC',          'Pompe à chaleur'),
    ('VMC',          'Ventilation mécanique contrôlée'),
    ('EQUILIBRAGE',  'Équilibrage réseau'),
    ('THERMOSTAT',   'Robinets thermostatiques / GTC');

INSERT INTO ref_document_types (code, label) VALUES
    ('FACTURE',  'Facture énergie'),
    ('PLAN',     'Plan architectural'),
    ('DTA',      'Dossier Technique Amiante'),
    ('CREP',     'Constat de Risque d'Exposition au Plomb'),
    ('RAPPORT',  'Rapport d'audit'),
    ('DEVIS',    'Devis travaux'),
    ('PHOTO',    'Photographie de site'),
    ('CR',       'Compte-rendu'),
    ('AUTRE',    'Autre document');

INSERT INTO ref_task_statuses (code, label, is_terminal) VALUES
    ('todo',       'À faire',        false),
    ('ready',      'Prêt',           false),
    ('in_progress','En cours',       false),
    ('blocked',    'Bloqué',         false),
    ('review',     'En révision',    false),
    ('done',       'Terminé',        true),
    ('archived',   'Archivé',        true),
    ('cancelled',  'Annulé',         true);

INSERT INTO ref_priorities (code, label, sort_order) VALUES
    ('low',      'Faible',    1),
    ('medium',   'Moyenne',   2),
    ('high',     'Haute',     3),
    ('critical', 'Critique',  4);

INSERT INTO roles (code, name, description) VALUES
    ('owner',               'Propriétaire',          'Accès total à l'organisation'),
    ('admin',               'Administrateur',         'Gestion des utilisateurs et configuration'),
    ('project_manager',     'Chef de projet',         'Gestion des projets et bâtiments'),
    ('thermal_engineer',    'Ingénieur thermique',    'Saisie et validation des audits'),
    ('analyst',             'Analyste',               'Lecture et analyse des données'),
    ('viewer',              'Lecteur',                'Accès lecture seule'),
    ('ai_agent',            'Agent IA',               'Compte technique pour agents IA'),
    ('integration_service', 'Service d'intégration', 'Compte technique pour intégrations API');

-- =============================================================================
-- VUES RECOMMANDÉES
-- =============================================================================

-- Vue : tâches actives par workspace (hors terminées et annulées)
CREATE OR REPLACE VIEW vw_active_tasks_by_workspace AS
SELECT
    t.id,
    t.workspace_id,
    t.title,
    t.task_type,
    t.priority,
    t.status,
    t.assignee_user_id,
    t.assignee_agent_type,
    t.due_date,
    t.next_action,
    t.updated_at
FROM tasks t
WHERE t.status NOT IN ('done', 'archived', 'cancelled');

-- Vue : tâches bloquées avec leurs bloquants
CREATE OR REPLACE VIEW vw_blocked_tasks AS
SELECT
    t.id                    AS task_id,
    t.title                 AS task_title,
    t.workspace_id,
    td.depends_on_task_id   AS blocking_task_id,
    bt.title                AS blocking_task_title,
    bt.status               AS blocking_task_status
FROM tasks t
JOIN task_dependencies td ON td.task_id = t.id
JOIN tasks bt ON bt.id = td.depends_on_task_id
WHERE t.status = 'blocked'
  AND bt.status NOT IN ('done', 'cancelled');

-- Vue : dernier snapshot de contexte par tâche
CREATE OR REPLACE VIEW vw_latest_task_snapshot AS
SELECT DISTINCT ON (tss.task_id)
    tss.task_id,
    tss.snapshot_label,
    tss.summary_completed,
    tss.summary_remaining,
    tss.open_questions,
    tss.resume_instructions,
    tss.created_at
FROM task_session_snapshots tss
ORDER BY tss.task_id, tss.created_at DESC;

-- Vue : dernière version d'audit par bâtiment
CREATE OR REPLACE VIEW vw_audit_latest_version AS
SELECT DISTINCT ON (a.building_id)
    a.id                            AS audit_id,
    a.building_id,
    a.project_id,
    a.organization_id,
    a.audit_type,
    a.status,
    a.version_number,
    a.computed_energy_label,
    a.computed_ghg_label,
    a.baseline_energy_consumption_kwh,
    a.baseline_co2_kg,
    a.created_at
FROM audits a
ORDER BY a.building_id, a.created_at DESC;

-- Vue : résumé financier des scénarios
CREATE OR REPLACE VIEW vw_scenario_financial_summary AS
SELECT
    rs.id                           AS scenario_id,
    rs.audit_id,
    rs.name                         AS scenario_name,
    rs.scenario_type,
    rs.status,
    rs.target_energy_label,
    rs.estimated_total_cost_eur,
    rs.estimated_annual_savings_eur,
    rs.simple_payback_years,
    sf.total_aids_eur,
    sf.net_cost_eur,
    sf.npv_eur,
    sf.irr_percent
FROM renovation_scenarios rs
LEFT JOIN scenario_financials sf ON sf.scenario_id = rs.id;

-- Vue : baseline énergétique par bâtiment
CREATE OR REPLACE VIEW vw_building_energy_baseline AS
SELECT
    b.id                AS building_id,
    b.organization_id,
    b.name              AS building_name,
    b.city,
    b.heated_area_m2,
    b.current_energy_label,
    b.current_ghg_label,
    a.audit_id,
    a.computed_energy_label,
    a.computed_ghg_label,
    a.baseline_energy_consumption_kwh,
    a.baseline_co2_kg,
    CASE
        WHEN b.heated_area_m2 > 0
        THEN ROUND((a.baseline_energy_consumption_kwh / b.heated_area_m2)::NUMERIC, 1)
        ELSE NULL
    END                 AS specific_consumption_kwh_m2
FROM buildings b
LEFT JOIN vw_audit_latest_version a ON a.building_id = b.id;

-- =============================================================================
-- FIN DU SCRIPT
-- =============================================================================

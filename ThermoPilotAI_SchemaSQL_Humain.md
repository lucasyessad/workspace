# ThermoPilot AI — Schéma SQL/PostgreSQL complet

## 1. Objectif

Ce document décrit le modèle de données PostgreSQL recommandé pour ThermoPilot AI, une plateforme SaaS B2B d’analyse énergétique des copropriétés, de simulation de travaux, de génération de rapports et de suivi d’exécution.

Le schéma a été conçu pour répondre à cinq besoins principaux :
- multi-tenant sécurisé ;
- traçabilité complète des audits et calculs ;
- stockage structuré des caractéristiques bâtimentaires et énergétiques ;
- gestion du backlog, des tâches et de leur historique ;
- préparation d’une architecture scalable compatible API, IA et automatisations.

## 2. Principes d’architecture des données

### 2.1 Multi-tenant

Chaque donnée métier est rattachée à une organisation (`organizations`) afin de garantir l’isolation logique entre clients B2B.  
Toutes les tables critiques contiennent soit directement `organization_id`, soit héritent du rattachement via leur entité parente.

### 2.2 Traçabilité forte

Les entités d’audit, de calcul, de scénario, de rapport et de tâche disposent :
- d’un statut,
- de dates de création et mise à jour,
- d’un auteur ou déclencheur lorsque pertinent,
- d’un historique dans des tables dédiées.

### 2.3 Normalisation maîtrisée

Le schéma est volontairement normalisé pour les données cœur, mais conserve certains champs JSONB afin de :
- stocker des données hétérogènes issues de documents ou d’extractions IA ;
- permettre l’évolution fonctionnelle sans migration lourde immédiate ;
- conserver des snapshots de calcul et des entrées/sorties techniques.

### 2.4 Compatibilité IA et reprise de contexte

Le système inclut un module natif de sauvegarde des tâches, journaux, dépendances, snapshots et artefacts pour faciliter :
- la reprise de travail par une IA ;
- la priorisation de ce qu’il reste à faire ;
- la synchronisation entre backlog produit, exécution technique et livrables générés.

## 3. Vue d’ensemble des domaines fonctionnels

Le schéma est structuré autour de 12 domaines :

1. Identité et sécurité  
2. Organisations et abonnements  
3. Gestion des bâtiments  
4. Documents et médias  
5. Audits énergétiques  
6. Calculs et moteurs d’analyse  
7. Scénarios de rénovation  
8. Rapports générés  
9. Backlog produit et tâches  
10. Historique, journalisation et snapshots  
11. Intégrations et automatisations  
12. Référentiels métier

## 4. Tables principales

## 4.1 Identité et sécurité

### organizations
Organisation cliente ou entité interne.

Champs principaux :
- `id` UUID PK
- `name`
- `slug`
- `organization_type` : syndic, bureau_etudes, collectivite, admin, partenaire
- `billing_email`
- `country_code`
- `timezone`
- `is_active`
- `created_at`
- `updated_at`

### users
Utilisateurs de la plateforme.

Champs principaux :
- `id` UUID PK
- `organization_id` UUID FK
- `email` unique
- `password_hash` nullable si SSO
- `first_name`
- `last_name`
- `job_title`
- `phone`
- `status`
- `last_login_at`
- `created_at`
- `updated_at`

### roles
Rôles applicatifs.

Exemples :
- owner
- admin
- project_manager
- thermal_engineer
- analyst
- viewer
- ai_agent
- integration_service

### user_roles
Association N-N entre utilisateurs et rôles.

### api_keys
Clés techniques pour intégrations/API.

Champs :
- `id`
- `organization_id`
- `name`
- `key_prefix`
- `key_hash`
- `scopes` JSONB
- `last_used_at`
- `expires_at`
- `revoked_at`

## 4.2 Organisations et abonnements

### subscription_plans
Catalogues de plans tarifaires.

### subscriptions
Abonnement actif d’une organisation.

Champs :
- `organization_id`
- `plan_id`
- `status`
- `starts_at`
- `ends_at`
- `billing_cycle`
- `max_users`
- `max_projects`
- `max_monthly_audits`
- `features` JSONB

### usage_counters
Compteurs mensuels ou journaliers.

Exemples :
- nombre d’audits
- stockage utilisé
- rapports générés
- appels API

## 4.3 Gestion des bâtiments

### building_projects
Projet métier regroupant un immeuble ou une copropriété suivie.

Champs :
- `id`
- `organization_id`
- `project_code`
- `name`
- `project_status`
- `client_reference`
- `primary_manager_user_id`
- `created_at`
- `updated_at`

### buildings
Bâtiment principal analysé.

Champs :
- `id`
- `organization_id`
- `project_id`
- `name`
- `address_line_1`
- `address_line_2`
- `postal_code`
- `city`
- `country_code`
- `latitude`
- `longitude`
- `construction_year`
- `building_type`
- `ownership_type`
- `heated_area_m2`
- `floors_above_ground`
- `floors_below_ground`
- `main_use_type`
- `occupancy_profile`
- `current_energy_label`
- `current_ghg_label`
- `created_at`
- `updated_at`

### building_blocks
Découpage en bâtiments / cages / ailes si résidence complexe.

### building_zones
Zones thermiques ou fonctionnelles.

### units
Lots, appartements, locaux, parties communes.

### systems
Systèmes techniques associés au bâtiment.

Exemples :
- chauffage
- ECS
- ventilation
- refroidissement
- production locale

Champs :
- `system_type`
- `energy_source`
- `brand`
- `model`
- `installation_year`
- `nominal_power_kw`
- `efficiency_nominal`
- `status`
- `metadata` JSONB

### envelopes
Éléments de l’enveloppe.

Exemples :
- murs
- toiture
- plancher bas
- menuiseries
- ponts thermiques descriptifs

Champs :
- `element_type`
- `orientation`
- `surface_m2`
- `u_value`
- `insulation_type`
- `insulation_thickness_mm`
- `condition_state`
- `metadata` JSONB

### metering_points
Points de comptage.

### energy_bills
Factures et consommations historiques.

Champs :
- `billing_period_start`
- `billing_period_end`
- `energy_type`
- `consumption_kwh`
- `cost_eur_ht`
- `cost_eur_ttc`
- `degree_days_base`
- `supplier_name`
- `invoice_reference`

## 4.4 Documents et médias

### files
Fichiers stockés en base logique, contenus sur objet storage.

Champs :
- `id`
- `organization_id`
- `storage_provider`
- `storage_bucket`
- `storage_key`
- `original_filename`
- `mime_type`
- `file_size_bytes`
- `checksum_sha256`
- `uploaded_by_user_id`
- `uploaded_at`

### file_links
Association polymorphe entre fichiers et objets métier.

Exemples :
- building
- audit
- report
- task
- scenario

### document_extractions
Résultats d’extraction OCR / parsing / IA.

Champs :
- `file_id`
- `extraction_type`
- `engine_name`
- `engine_version`
- `status`
- `raw_text`
- `structured_data` JSONB
- `confidence_score`
- `created_at`

### site_photos
Photos géolocalisées ou catégorisées de visite.

## 4.5 Audits énergétiques

### audits
Audit énergétique principal.

Champs :
- `id`
- `organization_id`
- `project_id`
- `building_id`
- `audit_type`
- `version_number`
- `status`
- `initiated_by_user_id`
- `validated_by_user_id`
- `reference_period_start`
- `reference_period_end`
- `weather_normalization_method`
- `baseline_energy_consumption_kwh`
- `baseline_energy_cost_eur`
- `baseline_co2_kg`
- `computed_energy_label`
- `computed_ghg_label`
- `assumptions` JSONB
- `input_snapshot` JSONB
- `result_snapshot` JSONB
- `created_at`
- `updated_at`

### audit_inputs
Variables d’entrée détaillées, normalisées ou semi-structurées.

### audit_observations
Constats techniques issus des visites.

### audit_issues
Anomalies ou points d’attention.

Exemples :
- pont thermique probable
- isolation inconnue
- incohérence documentaire
- donnée manquante

### audit_versions
Historique de version d’audit.

## 4.6 Calculs et moteurs d’analyse

### calculation_runs
Exécution d’un moteur de calcul.

Champs :
- `id`
- `organization_id`
- `audit_id`
- `calculation_type`
- `engine_name`
- `engine_version`
- `status`
- `started_at`
- `finished_at`
- `requested_by_user_id`
- `input_payload` JSONB
- `output_payload` JSONB
- `logs_excerpt`
- `error_code`
- `error_message`

### calculation_metrics
Métriques détaillées par run.

Exemples :
- besoin chauffage
- pertes ventilation
- pertes transmission
- consommation ECS
- émissions GES

### ai_analysis_runs
Exécution IA non réglementaire.

Exemples :
- classification photo
- extraction document
- suggestion travaux
- résumé technique

### ai_analysis_outputs
Sorties normalisées des analyses IA.

## 4.7 Scénarios de rénovation

### renovation_scenarios
Scénarios globaux de travaux.

Champs :
- `id`
- `organization_id`
- `audit_id`
- `name`
- `scenario_type`
- `status`
- `target_energy_label`
- `target_ghg_label`
- `estimated_total_cost_eur`
- `estimated_annual_savings_eur`
- `estimated_energy_savings_kwh`
- `estimated_co2_reduction_kg`
- `simple_payback_years`
- `priority_score`
- `notes`
- `created_at`
- `updated_at`

### renovation_measures
Mesures élémentaires de travaux.

Exemples :
- ITE façade
- isolation toiture
- remplacement chaudière
- PAC
- VMC hygro
- équilibrage
- robinets thermostatiques

Champs :
- `measure_type`
- `component_scope`
- `description`
- `quantity`
- `unit`
- `estimated_unit_cost_eur`
- `estimated_total_cost_eur`
- `expected_energy_gain_kwh`
- `expected_co2_gain_kg`
- `expected_maintenance_impact`
- `execution_complexity`
- `phasing_group`

### scenario_measure_links
Association scénario ↔ mesures.

### financial_aids
Aides financières potentielles.

### scenario_financials
Agrégation économique.

## 4.8 Rapports générés

### report_templates
Modèles de rapport.

### generated_reports
Rapports produits pour humains.

Champs :
- `id`
- `organization_id`
- `audit_id`
- `scenario_id`
- `template_id`
- `report_type`
- `version_number`
- `status`
- `language_code`
- `generated_by_user_id`
- `generation_context` JSONB
- `file_id`
- `created_at`

### report_sections
Sections composant un rapport.

### report_generation_logs
Journaux de génération.

## 4.9 Backlog produit et tâches

### workspaces
Espaces de travail transverses, utiles pour IA et équipes.

### epics
Grands chantiers produit ou projet.

### features
Fonctionnalités rattachées à un epic.

### tasks
Unité d’exécution centrale.

Champs :
- `id`
- `organization_id`
- `workspace_id`
- `epic_id`
- `feature_id`
- `parent_task_id`
- `related_entity_type`
- `related_entity_id`
- `title`
- `description`
- `task_type`
- `priority`
- `status`
- `assignee_user_id`
- `assignee_agent_type`
- `created_by_user_id`
- `estimated_hours`
- `actual_hours`
- `due_date`
- `started_at`
- `completed_at`
- `next_action`
- `definition_of_done`
- `acceptance_criteria` JSONB
- `tags` JSONB
- `created_at`
- `updated_at`

### task_dependencies
Dépendances explicites entre tâches.

### task_comments
Commentaires humains ou IA.

### task_checklists
Checklist détaillée.

### task_artifacts
Livrables produits par une tâche.

Exemples :
- fichier
- rapport
- script SQL
- spécification
- maquette
- log technique

## 4.10 Historique, journalisation et snapshots

### activity_logs
Journal applicatif transverse.

### entity_change_log
Historique générique par table/entité.

Champs :
- `entity_type`
- `entity_id`
- `change_type`
- `before_data` JSONB
- `after_data` JSONB
- `changed_by_user_id`
- `changed_by_agent`
- `changed_at`

### task_status_history
Historique immuable des transitions de tâches.

### task_session_snapshots
Snapshots de contexte pour reprise IA.

Champs :
- `task_id`
- `snapshot_label`
- `summary_completed`
- `summary_remaining`
- `open_questions`
- `resume_instructions`
- `context_payload` JSONB
- `created_at`

### checkpoints
Points de sauvegarde globaux par workspace ou projet.

### execution_runs
Traçage des exécutions automatisées liées à une tâche ou un workflow.

## 4.11 Intégrations et automatisations

### integrations
Connecteurs configurés.

Exemples :
- CRM
- GED
- stockage cloud
- messagerie
- calendrier
- ERP

### webhooks
Webhooks entrants ou sortants.

### automation_workflows
Définitions de workflow.

### workflow_runs
Exécution d’un workflow.

### workflow_steps
Étapes paramétrées.

### workflow_step_runs
Historique détaillé d’exécution.

## 4.12 Référentiels métier

### ref_energy_types
Électricité, gaz, fioul, réseau de chaleur, bois, etc.

### ref_system_types
Chauffage, ECS, ventilation, refroidissement, photovoltaïque.

### ref_measure_types
Catalogue des mesures de rénovation.

### ref_document_types
Facture, plan, DTA, CREP, rapport, devis, photo, compte-rendu.

### ref_task_statuses
todo, ready, in_progress, blocked, review, done, archived, cancelled.

### ref_priorities
low, medium, high, critical.

## 5. Relations structurantes

Relations clés :
- une organisation possède plusieurs utilisateurs, projets, bâtiments, fichiers, audits, tâches ;
- un projet contient plusieurs bâtiments ;
- un bâtiment possède plusieurs systèmes, enveloppes, zones, factures, documents ;
- un audit est rattaché à un bâtiment ;
- un audit peut produire plusieurs runs de calcul, plusieurs scénarios et plusieurs rapports ;
- un scénario contient plusieurs mesures ;
- une tâche peut être liée à n’importe quelle entité métier ;
- une tâche possède un historique, des dépendances, des artefacts et des snapshots.

## 6. Indexation recommandée

Index prioritaires :
- index sur tous les champs FK ;
- index composites sur `(organization_id, status)` pour les entités fortement filtrées ;
- index sur `(building_id, created_at desc)` pour audits ;
- index sur `(audit_id, status)` pour scénarios ;
- index sur `(task_id, created_at desc)` pour historique ;
- index GIN sur colonnes JSONB recherchées ;
- index partiels sur éléments actifs (`deleted_at is null`, `status in (...)`).

## 7. Contraintes de sécurité et conformité

Recommandations :
- activer Row Level Security si Supabase/PostgREST ;
- chiffrer les secrets hors base ou via KMS ;
- stocker uniquement des hash robustes pour les mots de passe et clés ;
- journaliser les accès critiques ;
- prévoir une politique de rétention pour logs et snapshots ;
- anonymiser les exports de debug si nécessaire.

## 8. Sauvegarde et reprise des tâches pour l’IA

Le système demandé de sauvegarde des tâches repose sur :
- `tasks` pour l’état courant ;
- `task_status_history` pour l’historique immuable ;
- `task_session_snapshots` pour résumer ce qui est terminé et ce qui reste à faire ;
- `task_dependencies` pour bloquants et ordre d’exécution ;
- `task_artifacts` pour relier les livrables ;
- `execution_runs` pour relier une exécution automatisée à une tâche ;
- `checkpoints` pour figer un état global de projet.

Cela permet à une IA de :
- reprendre le contexte sans relire tout l’historique brut ;
- identifier la prochaine action ;
- vérifier les dépendances et le statut réel ;
- retrouver les fichiers, scripts et documents déjà produits ;
- éviter les doublons de travail.

## 9. Convention de nommage

Convention retenue :
- tables au pluriel en snake_case ;
- colonnes en snake_case ;
- PK : `id` de type UUID ;
- FK : `<entity>_id` ;
- dates de traçabilité : `created_at`, `updated_at` ;
- suppression logique facultative : `deleted_at`.

## 10. Livrables techniques associés

Le schéma complet est fourni dans les fichiers suivants :
- un document humain de cadrage ;
- un fichier IA structuré ;
- un script SQL DDL PostgreSQL exécutable.

## 11. Recommandation technique finale

Pour une première version robuste :
- PostgreSQL 16 ;
- UUID natifs ;
- JSONB pour les payloads semi-structurés ;
- migrations via Alembic ou Prisma ;
- SQLAlchemy/FastAPI côté backend ;
- stockage objet S3-compatible pour les fichiers ;
- tâches asynchrones via Celery/RQ + Redis ;
- monitoring via logs structurés et métriques d’exécution.

Ce modèle est volontairement ambitieux mais réaliste.  
Il te donne une base solide pour construire un MVP sérieux sans te bloquer pour la suite.
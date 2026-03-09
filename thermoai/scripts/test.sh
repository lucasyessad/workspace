#!/bin/bash
# =============================================================
# ThermoAI — Script de lancement des tests
# Usage: ./scripts/test.sh [unit|integration|all]
# =============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

MODE="${1:-all}"

echo "=== ThermoAI — Tests ($MODE) ==="

# --- Tests unitaires (SQLite in-memory, pas de Docker) ---
run_unit_tests() {
    echo ""
    echo "▸ Tests unitaires (SQLite in-memory)..."
    cd "$ROOT_DIR/backend"
    python -m pytest tests/ -v --tb=short -m "not integration" "$@"
}

# --- Tests d'intégration (PostgreSQL + Redis via Docker) ---
run_integration_tests() {
    echo ""
    echo "▸ Démarrage de l'infra de test (PostgreSQL + Redis)..."
    docker compose -f "$ROOT_DIR/docker-compose.test.yml" up -d --wait

    echo ""
    echo "▸ Tests d'intégration..."
    cd "$ROOT_DIR/backend"

    # Charger les variables de test
    export $(grep -v '^#' "$ROOT_DIR/.env.test" | xargs)

    python -m pytest tests/ -v --tb=short -m "integration" "$@"
    local exit_code=$?

    echo ""
    echo "▸ Arrêt de l'infra de test..."
    docker compose -f "$ROOT_DIR/docker-compose.test.yml" down -v

    return $exit_code
}

# --- Tous les tests ---
run_all_tests() {
    echo ""
    echo "▸ Tous les tests (SQLite in-memory)..."
    cd "$ROOT_DIR/backend"
    python -m pytest tests/ -v --tb=short --cov=app --cov-report=term-missing "$@"
}

case "$MODE" in
    unit)
        run_unit_tests "${@:2}"
        ;;
    integration)
        run_integration_tests "${@:2}"
        ;;
    all)
        run_all_tests "${@:2}"
        ;;
    *)
        echo "Usage: $0 [unit|integration|all]"
        exit 1
        ;;
esac

echo ""
echo "=== Tests terminés ==="

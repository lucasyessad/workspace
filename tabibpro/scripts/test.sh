#!/bin/bash
# =============================================================
# TabibPro — Script de lancement des tests
# Usage: ./scripts/test.sh [unit|e2e|all]
# =============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

MODE="${1:-all}"

echo "=== TabibPro — Tests ($MODE) ==="

# --- Démarrer l'infra de test ---
start_infra() {
    echo ""
    echo "▸ Démarrage de l'infra de test (PostgreSQL x2, Redis, Meilisearch)..."
    docker compose -f "$ROOT_DIR/docker-compose.test.yml" up -d --wait
    echo "  ✓ Infra prête"
}

stop_infra() {
    echo ""
    echo "▸ Arrêt de l'infra de test..."
    docker compose -f "$ROOT_DIR/docker-compose.test.yml" down -v
}

# --- Tests unitaires ---
run_unit_tests() {
    echo ""
    echo "▸ Tests unitaires API (Vitest)..."
    cd "$ROOT_DIR"

    # Charger .env.test
    set -a && source .env.test && set +a

    pnpm --filter @tabibpro/api test

    echo ""
    echo "▸ Tests unitaires Web (Vitest + jsdom)..."
    pnpm --filter @tabibpro/web test
}

# --- Tests E2E ---
run_e2e_tests() {
    start_infra

    echo ""
    echo "▸ Tests E2E API..."
    cd "$ROOT_DIR"
    set -a && source .env.test && set +a

    pnpm --filter @tabibpro/api test:e2e

    echo ""
    echo "▸ Tests E2E Web (Playwright)..."
    pnpm --filter @tabibpro/web test:e2e

    stop_infra
}

# --- Tous les tests ---
run_all_tests() {
    start_infra

    echo ""
    echo "▸ Tous les tests..."
    cd "$ROOT_DIR"
    set -a && source .env.test && set +a

    pnpm test

    stop_infra
}

case "$MODE" in
    unit)
        run_unit_tests "${@:2}"
        ;;
    e2e)
        run_e2e_tests "${@:2}"
        ;;
    all)
        run_all_tests "${@:2}"
        ;;
    *)
        echo "Usage: $0 [unit|e2e|all]"
        exit 1
        ;;
esac

echo ""
echo "=== Tests terminés ==="

#!/bin/bash
# =============================================================
# AqarVision — Script de lancement des tests
# Usage: ./scripts/test.sh [unit|cov]
# =============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

MODE="${1:-unit}"

echo "=== AqarVision — Tests ($MODE) ==="

cd "$ROOT_DIR"

# Charger .env.test
if [ -f .env.test ]; then
    set -a && source .env.test && set +a
fi

case "$MODE" in
    unit)
        echo ""
        echo "▸ Tests unitaires (Vitest)..."
        npx vitest run
        ;;
    cov)
        echo ""
        echo "▸ Tests avec couverture..."
        npx vitest run --coverage
        ;;
    watch)
        echo ""
        echo "▸ Tests en mode watch..."
        npx vitest
        ;;
    *)
        echo "Usage: $0 [unit|cov|watch]"
        exit 1
        ;;
esac

echo ""
echo "=== Tests terminés ==="

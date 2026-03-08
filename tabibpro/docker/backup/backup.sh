#!/bin/bash
# ============================================================
# TabibPro — Script de Sauvegarde Automatique
# Sauvegarde chiffrée des bases de données et fichiers
# Conformité Loi 18-07 (protection des données)
# ============================================================

set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
ENCRYPTION_KEY="${ENCRYPTION_KEY}"

echo "=============================================="
echo " TabibPro — Sauvegarde ${TIMESTAMP}"
echo "=============================================="

# Créer répertoire de backup du jour
mkdir -p "${BACKUP_DIR}/${TIMESTAMP}"

# ---- 1. Sauvegarde base de données médicale ----
echo "[$(date)] Sauvegarde DB médicale..."
PGPASSWORD="${PGPASSWORD_MEDICAL}" pg_dump \
    -h postgres-medical \
    -U "${DB_MEDICAL_USER:-medgest}" \
    -d "${DB_MEDICAL_NAME:-tabibpro_medical}" \
    --format=custom \
    --compress=9 \
    --file="${BACKUP_DIR}/${TIMESTAMP}/medical.dump"

echo "[$(date)] DB médicale: OK ($(du -sh ${BACKUP_DIR}/${TIMESTAMP}/medical.dump | cut -f1))"

# ---- 2. Sauvegarde base de données service ----
echo "[$(date)] Sauvegarde DB service..."
PGPASSWORD="${PGPASSWORD_SERVICE}" pg_dump \
    -h postgres-service \
    -U "${DB_SERVICE_USER:-medgest}" \
    -d "${DB_SERVICE_NAME:-tabibpro_service}" \
    --format=custom \
    --compress=9 \
    --file="${BACKUP_DIR}/${TIMESTAMP}/service.dump" 2>/dev/null || echo "[$(date)] DB service: ignorée (cloud mode)"

# ---- 3. Chiffrement des backups (Loi 18-07) ----
echo "[$(date)] Chiffrement AES-256..."
for file in "${BACKUP_DIR}/${TIMESTAMP}"/*.dump; do
    if [ -f "$file" ]; then
        openssl enc -aes-256-cbc \
            -pbkdf2 \
            -iter 100000 \
            -k "${ENCRYPTION_KEY}" \
            -in "$file" \
            -out "${file}.enc"
        rm "$file"  # Supprimer la version non chiffrée
        echo "[$(date)] Chiffré: $(basename ${file}).enc"
    fi
done

# ---- 4. Archive finale ----
echo "[$(date)] Création archive finale..."
tar -czf "${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz" \
    -C "${BACKUP_DIR}" \
    "${TIMESTAMP}/"

rm -rf "${BACKUP_DIR}/${TIMESTAMP}/"

BACKUP_SIZE=$(du -sh "${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz" | cut -f1)
echo "[$(date)] Archive créée: backup_${TIMESTAMP}.tar.gz (${BACKUP_SIZE})"

# ---- 5. Nettoyage des vieilles sauvegardes ----
echo "[$(date)] Nettoyage des sauvegardes > ${RETENTION_DAYS} jours..."
find "${BACKUP_DIR}" -name "backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete
REMAINING=$(ls "${BACKUP_DIR}"/backup_*.tar.gz 2>/dev/null | wc -l)
echo "[$(date)] Sauvegardes restantes: ${REMAINING}"

# ---- 6. Rapport ----
echo ""
echo "=============================================="
echo " ✅ Sauvegarde terminée: ${TIMESTAMP}"
echo " 📁 Taille: ${BACKUP_SIZE}"
echo " 🔒 Chiffrée: AES-256-CBC"
echo " 📅 Rétention: ${RETENTION_DAYS} jours"
echo "=============================================="

exit 0

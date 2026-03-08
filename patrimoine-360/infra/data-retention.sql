-- ============================================
-- Patrimoine 360° — Politique de conservation des données
-- ============================================

-- 1. Suppression automatique des audit_logs de plus de 90 jours
-- À exécuter via Supabase pg_cron ou un cron externe

CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Suppression automatique des exports de plus de 30 jours
CREATE OR REPLACE FUNCTION cleanup_old_exports()
RETURNS void AS $$
BEGIN
  DELETE FROM exports
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Archivage des analyses IA — ne garder que les 20 dernières par module
CREATE OR REPLACE FUNCTION cleanup_old_analyses()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_analyses
  WHERE id IN (
    SELECT id FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY user_id, module_id ORDER BY created_at DESC) AS rn
      FROM ai_analyses
    ) ranked
    WHERE rn > 20
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Suppression des comptes inactifs depuis plus de 365 jours
-- ATTENTION: à exécuter avec précaution, notifier l'utilisateur avant
CREATE OR REPLACE FUNCTION flag_inactive_accounts()
RETURNS TABLE(user_id uuid, last_activity timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT up.user_id, up.updated_at AS last_activity
  FROM user_profiles up
  WHERE up.updated_at < NOW() - INTERVAL '365 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Suppression complète des données d'un utilisateur (RGPD)
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id uuid)
RETURNS void AS $$
BEGIN
  DELETE FROM copilot_conversations WHERE user_id = target_user_id;
  DELETE FROM reminders WHERE user_id = target_user_id;
  DELETE FROM user_objectives WHERE user_id = target_user_id;
  DELETE FROM exports WHERE user_id = target_user_id;
  DELETE FROM ai_analyses WHERE user_id = target_user_id;
  DELETE FROM user_module_results WHERE user_id = target_user_id;
  DELETE FROM user_module_data WHERE user_id = target_user_id;
  DELETE FROM onboarding_sessions WHERE user_id = target_user_id;
  DELETE FROM subscriptions WHERE user_id = target_user_id;
  DELETE FROM audit_logs WHERE user_id = target_user_id;
  DELETE FROM user_profiles WHERE user_id = target_user_id;
  DELETE FROM user_data WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Planification des crons (si pg_cron disponible)
-- SELECT cron.schedule('cleanup-audit-logs', '0 3 * * 0', 'SELECT cleanup_old_audit_logs()');
-- SELECT cron.schedule('cleanup-exports', '0 3 1 * *', 'SELECT cleanup_old_exports()');
-- SELECT cron.schedule('cleanup-analyses', '0 4 1 * *', 'SELECT cleanup_old_analyses()');

"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { apiKeysApi } from "@/lib/api";
import { KeyRound, Copy, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  full_key?: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const { addToast } = useToast();
  const success = (msg: string) => addToast(msg, "success");
  const error = (msg: string) => addToast(msg, "error");

  useEffect(() => {
    apiKeysApi
      .list()
      .then((r) => setKeys(r.data))
      .catch((e) => {
        if (e.response?.status === 403) {
          setPlanError(e.response.data?.detail ?? "Plan Enterprise requis");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const r = await apiKeysApi.create({ name: newName });
      const created: ApiKey = r.data;
      setKeys((k) => [created, ...k]);
      setRevealedKey(created.id);
      setNewName("");
      setShowForm(false);
      success("Clé API créée — copiez-la maintenant, elle ne sera plus visible.");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? "Erreur";
      error(msg);
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Révoquer cette clé ? Les intégrations utilisant cette clé cesseront de fonctionner.")) return;
    try {
      await apiKeysApi.revoke(id);
      setKeys((k) => k.filter((key) => key.id !== id));
      success("Clé révoquée");
    } catch {
      error("Erreur lors de la révocation");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    success("Clé copiée dans le presse-papier");
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clés API</h1>
            <p className="text-gray-500 mt-1">Gérez vos clés d&apos;accès à l&apos;API ThermoPilot</p>
          </div>
          {!planError && (
            <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
              <Plus size={16} />
              Nouvelle clé
            </button>
          )}
        </div>

        {/* Plan error */}
        {planError && (
          <div className="card p-6 text-center mb-6 border-amber-200 bg-amber-50">
            <KeyRound size={40} className="mx-auto text-amber-400 mb-3" />
            <p className="font-semibold text-amber-800">{planError}</p>
            <p className="text-sm text-amber-600 mt-1">
              Passez au plan Enterprise pour créer des clés API.
            </p>
            <a href="/settings/billing" className="btn-primary mt-4 inline-flex">
              Voir les plans
            </a>
          </div>
        )}

        {/* Create form */}
        {showForm && !planError && (
          <form onSubmit={handleCreate} className="card p-5 mb-6 border-brand-200 bg-brand-50">
            <p className="font-semibold text-gray-800 mb-3">Créer une nouvelle clé</p>
            <div className="flex gap-3">
              <input
                type="text"
                className="input flex-1"
                placeholder="Nom de la clé (ex: Integration Immo)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? "Création..." : "Créer"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Keys list */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Chargement...</div>
        ) : !planError && keys.length === 0 ? (
          <div className="card p-12 text-center">
            <KeyRound size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune clé API</p>
            <p className="text-sm text-gray-400 mt-1">
              Créez une clé pour intégrer ThermoPilot à vos outils
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div key={key.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <KeyRound size={16} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{key.name}</p>
                      <p className="text-xs text-gray-400 font-mono">
                        {key.key_prefix}
                        {"•".repeat(20)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {key.last_used_at && (
                      <span className="text-xs text-gray-400">
                        Utilisée le {new Date(key.last_used_at).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                    <button
                      className="btn-secondary py-1.5 text-xs"
                      onClick={() => handleRevoke(key.id)}
                    >
                      <Trash2 size={13} />
                      Révoquer
                    </button>
                  </div>
                </div>

                {/* Full key — only shown once after creation */}
                {key.full_key && revealedKey === key.id && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-700 mb-2">
                      Copiez cette clé maintenant — elle ne sera plus affichée.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-amber-900 break-all flex-1">
                        {key.full_key}
                      </code>
                      <button
                        className="shrink-0"
                        onClick={() => copyToClipboard(key.full_key!)}
                      >
                        <Copy size={16} className="text-amber-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Usage docs */}
        {!planError && (
          <div className="mt-8 card p-5 bg-gray-50">
            <p className="font-semibold text-gray-700 mb-2 text-sm">Utilisation</p>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {`curl -H "X-API-Key: tp_live_votre_cle" \\
     https://api.thermopilot.ai/api/audits`}
            </pre>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

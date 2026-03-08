"use client";

import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  nom_agence: string;
  email: string;
  telephone: string;
  wilaya: string;
  created_at: string;
  subscriptions?: { plan_type: string; status: string; trial_end: string }[];
}

/** Page de gestion des utilisateurs (admin) */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (p: number, q: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), search: q });
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers(page, search);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, search);
  };

  const handleAction = async (
    userId: string,
    action: string,
    value?: string
  ) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, value }),
    });

    if (res.ok) {
      fetchUsers(page, search);
    }
  };

  const getPlanBadge = (sub?: User["subscriptions"]) => {
    if (!sub || sub.length === 0) return <Badge variant="outline">Aucun</Badge>;
    const s = sub[0];
    const colors: Record<string, string> = {
      trial: "bg-blue-100 text-blue-700",
      starter: "bg-gray-100 text-gray-700",
      pro: "bg-or/20 text-or",
      enterprise: "bg-purple-100 text-purple-700",
    };
    return (
      <Badge className={colors[s.plan_type] || ""}>
        {s.plan_type} ({s.status})
      </Badge>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bleu-nuit">
          Utilisateurs ({total})
        </h1>
      </div>

      {/* Barre de recherche */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une agence ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} variant="or">
          Rechercher
        </Button>
      </div>

      {/* Tableau */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-or" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-500">Agence</th>
                    <th className="text-left p-4 font-medium text-gray-500">Email</th>
                    <th className="text-left p-4 font-medium text-gray-500">Téléphone</th>
                    <th className="text-left p-4 font-medium text-gray-500">Plan</th>
                    <th className="text-left p-4 font-medium text-gray-500">Inscription</th>
                    <th className="text-left p-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{u.nom_agence}</td>
                      <td className="p-4 text-gray-600">{u.email}</td>
                      <td className="p-4 text-gray-600">{u.telephone || "—"}</td>
                      <td className="p-4">{getPlanBadge(u.subscriptions)}</td>
                      <td className="p-4 text-gray-500">
                        {new Date(u.created_at).toLocaleDateString("fr-DZ")}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(u.id, "change_plan", "pro")}
                          >
                            → Pro
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500"
                            onClick={() => handleAction(u.id, "suspend")}
                          >
                            Suspendre
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} sur {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

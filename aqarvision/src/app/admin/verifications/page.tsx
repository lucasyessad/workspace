"use client";

import { useEffect, useState } from "react";
import {
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Verification {
  id: string;
  document_type: string;
  document_url: string;
  status: string;
  notes: string | null;
  created_at: string;
  profiles: { nom_agence: string; email: string };
  listings: { titre: string };
}

/** Page de gestion des vérifications de documents (admin) */
export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});

  const fetchData = async (p: number, status: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), status });
    const res = await fetch(`/api/admin/verifications?${params}`);
    const data = await res.json();
    setVerifications(data.verifications || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchData(page, filter);
  }, [page, filter]);

  const handleAction = async (verificationId: string, action: "verify" | "reject") => {
    const notes = actionNotes[verificationId] || "";
    const res = await fetch("/api/admin/verifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationId, action, notes }),
    });

    if (res.ok) {
      fetchData(page, filter);
    }
  };

  const statusFilters = [
    { value: "pending", label: "En attente", icon: Clock },
    { value: "under_review", label: "En cours", icon: FileCheck },
    { value: "verified", label: "Vérifiés", icon: CheckCircle },
    { value: "rejected", label: "Rejetés", icon: XCircle },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-bleu-nuit mb-6">
        Vérifications de documents ({total})
      </h1>

      {/* Filtres par statut */}
      <div className="flex gap-2 mb-6">
        {statusFilters.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={filter === value ? "or" : "outline"}
            size="sm"
            onClick={() => {
              setFilter(value);
              setPage(1);
            }}
          >
            <Icon className="h-4 w-4 mr-1" />
            {label}
          </Button>
        ))}
      </div>

      {/* Liste des vérifications */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-or" />
        </div>
      ) : verifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Aucune vérification avec le statut &quot;{filter}&quot;
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {verifications.map((v) => (
            <Card key={v.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-bleu-nuit">
                        {v.profiles?.nom_agence || "Agence"}
                      </h3>
                      <Badge variant="outline">{v.document_type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Annonce : {v.listings?.titre || "—"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Soumis le {new Date(v.created_at).toLocaleDateString("fr-DZ")}
                    </p>
                    {v.document_url && (
                      <a
                        href={v.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Voir le document
                      </a>
                    )}
                    {v.notes && (
                      <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                        Notes : {v.notes}
                      </p>
                    )}
                  </div>

                  {filter === "pending" || filter === "under_review" ? (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <textarea
                        placeholder="Notes (optionnel)..."
                        className="w-full text-sm border rounded-lg p-2 resize-none h-16"
                        value={actionNotes[v.id] || ""}
                        onChange={(e) =>
                          setActionNotes((prev) => ({
                            ...prev,
                            [v.id]: e.target.value,
                          }))
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                          onClick={() => handleAction(v.id, "verify")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Vérifier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-200 flex-1"
                          onClick={() => handleAction(v.id, "reject")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Badge
                      className={
                        v.status === "verified"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {v.status === "verified" ? "Vérifié" : "Rejeté"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
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

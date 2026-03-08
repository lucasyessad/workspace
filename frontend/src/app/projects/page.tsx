"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { buildingsApi, auditsApi } from "@/lib/api";
import { BuildingProject, Building, Audit } from "@/types";
import { FolderOpen, Plus, Building2, ClipboardList, MapPin, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  active:    { label: "Actif",    color: "bg-green-50 text-green-700",  dot: "bg-green-500" },
  on_hold:   { label: "En pause", color: "bg-amber-50 text-amber-700",  dot: "bg-amber-400" },
  completed: { label: "Clôturé",  color: "bg-gray-100 text-gray-500",   dot: "bg-gray-400" },
  archived:  { label: "Archivé",  color: "bg-gray-50 text-gray-400",    dot: "bg-gray-300" },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<BuildingProject[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([buildingsApi.listProjects(), buildingsApi.listBuildings(), auditsApi.list()])
      .then(([p, b, a]) => {
        setProjects(p.data);
        setBuildings(b.data);
        setAudits(a.data);
      })
      .finally(() => setLoading(false));
  }, []);

  function getBuildingsForProject(projectId: string) {
    return buildings.filter((b) => b.project_id === projectId);
  }

  function getAuditsForProject(projectId: string) {
    const bids = new Set(getBuildingsForProject(projectId).map((b) => b.id));
    return audits.filter((a) => bids.has(a.building_id));
  }

  function getCompletedAudits(projectId: string) {
    return getAuditsForProject(projectId).filter(
      (a) => a.status === "completed" || a.status === "validated"
    );
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              {projects.length} projet{projects.length !== 1 ? "s" : ""} dans votre portefeuille
            </p>
          </div>
          <Link href="/projects/new" className="btn-primary">
            <Plus size={16} />
            Nouveau projet
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-16 text-center">
            <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun projet</h3>
            <p className="text-gray-500 mb-6 text-sm max-w-sm mx-auto">
              Créez un projet pour regrouper vos bâtiments, audits, plans de rénovation et documents.
            </p>
            <Link href="/projects/new" className="btn-primary inline-flex">
              <Plus size={16} /> Créer un projet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => {
              const blds = getBuildingsForProject(project.id);
              const auds = getAuditsForProject(project.id);
              const completed = getCompletedAudits(project.id);
              const status = STATUS_LABELS[project.project_status] ?? STATUS_LABELS.active;
              const cities = [...new Set(blds.map((b) => b.city).filter(Boolean))].slice(0, 2);

              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="card p-5 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                        {project.project_code && (
                          <p className="text-xs text-gray-400 mt-0.5">#{project.project_code}</p>
                        )}
                      </div>
                      <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-500 transition-colors mt-1 flex-shrink-0" />
                    </div>

                    {/* Location */}
                    {cities.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                        <MapPin size={11} />
                        <span>{cities.join(", ")}</span>
                      </div>
                    )}

                    {/* Description */}
                    {project.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Building2 size={13} />
                        <span>{blds.length} bâtiment{blds.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <ClipboardList size={13} />
                        <span>{auds.length} audit{auds.length !== 1 ? "s" : ""}</span>
                      </div>
                      {completed.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-green-600 ml-auto">
                          <CheckCircle2 size={13} />
                          <span>{completed.length} complété{completed.length !== 1 ? "s" : ""}</span>
                        </div>
                      )}
                      {auds.length > 0 && completed.length === 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 ml-auto">
                          <Clock size={13} />
                          <span>En cours</span>
                        </div>
                      )}
                    </div>

                    {/* Method tag */}
                    {project.calculation_method && (
                      <div className="mt-2">
                        <span className="text-[10px] bg-gray-50 border border-gray-200 text-gray-500 px-2 py-0.5 rounded">
                          {project.calculation_method} · {project.climate_zone ?? "—"}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

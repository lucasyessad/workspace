"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Conversation {
  id: string;
  visitor_id: string;
  listing_id: string | null;
  dernier_message: string | null;
  dernier_message_at: string | null;
  agent_non_lu: number;
  visitor: {
    nom_agence: string;
    logo_url: string | null;
  } | null;
  listing: {
    titre: string;
    photos: string[];
  } | null;
}

function formatDateRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffJ = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin}min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffJ === 1) return "hier";
  if (diffJ < 7) return `il y a ${diffJ}j`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export default function DashboardMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("conversations")
        .select(
          "*, visitor:profiles!conversations_visitor_id_fkey(nom_agence, logo_url), listing:listings(titre, photos)"
        )
        .eq("agent_id", user.id)
        .order("dernier_message_at", { ascending: false });

      setConversations((data as Conversation[]) ?? []);
      setLoading(false);
    }

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-[#b8963e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-5 w-5 text-[#0c1b2a]" />
        <h1 className="text-xl font-bold text-[#0c1b2a]">Messages</h1>
        {conversations.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
            {conversations.length}
          </span>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-16 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-[#0c1b2a] mb-1">
            Aucune conversation
          </p>
          <p className="text-xs text-gray-500">
            Les messages de vos visiteurs apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
          {conversations.map((conv) => {
            const visitorName =
              conv.visitor?.nom_agence || "Visiteur";

            return (
              <Link
                key={conv.id}
                href={`/dashboard/messages/${conv.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Visitor avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {conv.visitor?.logo_url ? (
                    <img
                      src={conv.visitor.logo_url}
                      alt={visitorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-gray-500">
                      {visitorName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-[#0c1b2a] truncate">
                      {visitorName}
                    </span>
                    {conv.dernier_message_at && (
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatDateRelative(conv.dernier_message_at)}
                      </span>
                    )}
                  </div>
                  {conv.listing && (
                    <p className="text-xs text-[#b8963e] truncate mb-0.5">
                      {conv.listing.titre}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 truncate">
                    {conv.dernier_message ?? "Nouvelle conversation"}
                  </p>
                </div>

                {/* Unread badge */}
                {conv.agent_non_lu > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[#b8963e] flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-white">
                      {conv.agent_non_lu}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ClearHistoryButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClear() {
    if (loading) return;
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer tout votre historique de recherche ?"
    );
    if (!confirmed) return;

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("search_history")
        .delete()
        .eq("visitor_id", user.id);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClear}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Tout effacer
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function RemoveFavoriteButton({ favoriteId }: { favoriteId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    if (loading) return;
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", favoriteId);

    if (!error) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
      title="Retirer des favoris"
    >
      <HeartOff className="h-4 w-4" />
    </button>
  );
}

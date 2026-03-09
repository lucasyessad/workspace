"use client";

import { useState } from "react";
import { Share2, Check, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BoutonPartageProps {
  titre: string;
}

export function BoutonPartage({ titre }: BoutonPartageProps) {
  const [copie, setCopie] = useState(false);

  async function partager() {
    const url = window.location.href;

    // Use native share API on mobile if available
    if (navigator.share) {
      try {
        await navigator.share({ title: titre, url });
        return;
      } catch {
        // User cancelled or error — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Last resort fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 relative"
      onClick={partager}
      title="Partager"
    >
      {copie ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
    </Button>
  );
}

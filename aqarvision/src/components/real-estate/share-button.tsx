'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <Button variant="outline" onClick={handleShare} className="gap-2">
      <Share2 className="h-4 w-4" />
      Partager
    </Button>
  );
}

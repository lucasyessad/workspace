'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportButtonProps {
  propertyId: string;
}

export function ReportButton({ propertyId }: ReportButtonProps) {
  const [reported, setReported] = useState(false);

  function handleReport() {
    // For now, just mark as reported visually
    // TODO: Connect to backend reporting action
    setReported(true);
  }

  if (reported) {
    return (
      <p className="text-xs text-muted-foreground">Signalement envoyé. Merci.</p>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs text-muted-foreground hover:text-destructive"
      onClick={handleReport}
    >
      <Flag className="mr-1 h-3 w-3" />
      Signaler cette annonce
    </Button>
  );
}

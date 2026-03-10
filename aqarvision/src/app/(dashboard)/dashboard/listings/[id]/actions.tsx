'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { publishProperty, archiveProperty } from '@/lib/actions';
import type { PropertyStatus } from '@/types';

interface PropertyActionsProps {
  propertyId: string;
  status: PropertyStatus;
}

export function PropertyActions({ propertyId, status }: PropertyActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);
    const result = await publishProperty(propertyId);
    setLoading(false);
    if (result.success) router.refresh();
  }

  async function handleArchive() {
    setLoading(true);
    const result = await archiveProperty(propertyId);
    setLoading(false);
    if (result.success) router.refresh();
  }

  return (
    <div className="flex gap-2">
      {status === 'draft' && (
        <Button onClick={handlePublish} disabled={loading} variant="or">
          {loading ? 'Publication...' : 'Publier'}
        </Button>
      )}
      {status === 'published' && (
        <Button onClick={handleArchive} disabled={loading} variant="outline">
          {loading ? 'Archivage...' : 'Archiver'}
        </Button>
      )}
    </div>
  );
}

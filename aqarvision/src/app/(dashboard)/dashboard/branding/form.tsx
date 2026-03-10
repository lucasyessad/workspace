'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateAgencyBranding } from '@/lib/actions';
import type { Agency } from '@/types';

interface BrandingFormProps {
  agency: Agency;
  canEdit: boolean;
}

export function BrandingForm({ agency, canEdit }: BrandingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateAgencyBranding({
      name: formData.get('name') as string,
      slogan: (formData.get('slogan') as string) || null,
      description: (formData.get('description') as string) || null,
      primary_color: formData.get('primary_color') as string,
      phone: (formData.get('phone') as string) || null,
      email: (formData.get('email') as string) || null,
      address: (formData.get('address') as string) || null,
    });

    setLoading(false);
    if (result.success) {
      setSuccess(true);
      router.refresh();
    } else {
      setError(result.error ?? 'Erreur');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Nom de l'agence</label>
        <Input id="name" name="name" defaultValue={agency.name} required disabled={!canEdit} />
      </div>
      <div>
        <label htmlFor="slogan" className="mb-1.5 block text-sm font-medium">Slogan</label>
        <Input id="slogan" name="slogan" defaultValue={agency.slogan ?? ''} disabled={!canEdit} />
      </div>
      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium">Description</label>
        <Textarea id="description" name="description" defaultValue={agency.description ?? ''} rows={4} disabled={!canEdit} />
      </div>
      <div>
        <label htmlFor="primary_color" className="mb-1.5 block text-sm font-medium">Couleur principale</label>
        <div className="flex items-center gap-3">
          <input type="color" id="primary_color" name="primary_color" defaultValue={agency.primary_color} className="h-10 w-10 cursor-pointer rounded border" disabled={!canEdit} />
          <Input name="primary_color_text" defaultValue={agency.primary_color} className="max-w-32" disabled />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">Téléphone</label>
          <Input id="phone" name="phone" defaultValue={agency.phone ?? ''} disabled={!canEdit} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
          <Input id="email" name="email" type="email" defaultValue={agency.email ?? ''} disabled={!canEdit} />
        </div>
      </div>
      <div>
        <label htmlFor="address" className="mb-1.5 block text-sm font-medium">Adresse</label>
        <Input id="address" name="address" defaultValue={agency.address ?? ''} disabled={!canEdit} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-success">Branding mis à jour.</p>}

      {canEdit && (
        <Button type="submit" disabled={loading}>
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      )}
    </form>
  );
}

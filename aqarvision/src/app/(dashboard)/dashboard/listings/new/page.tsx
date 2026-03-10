'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WilayaSelector } from '@/components/algeria/wilaya-selector';
import { createProperty } from '@/lib/actions';
import type { PropertyFormValues } from '@/lib/validators';

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wilaya, setWilaya] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    const values: PropertyFormValues = {
      title: formData.get('title') as string,
      transaction_type: formData.get('transaction_type') as PropertyFormValues['transaction_type'],
      property_type: formData.get('property_type') as PropertyFormValues['property_type'],
      price: Number(formData.get('price')),
      wilaya,
      commune: (formData.get('commune') as string) || undefined,
      description: (formData.get('description') as string) || undefined,
      surface: formData.get('surface') ? Number(formData.get('surface')) : undefined,
      rooms: formData.get('rooms') ? Number(formData.get('rooms')) : undefined,
      bedrooms: formData.get('bedrooms') ? Number(formData.get('bedrooms')) : undefined,
      bathrooms: formData.get('bathrooms') ? Number(formData.get('bathrooms')) : undefined,
      negotiable: formData.get('negotiable') === 'on',
      status: 'draft',
      amenities: [],
    };

    const result = await createProperty(values);
    setLoading(false);

    if (result.success && result.data) {
      router.push(`/dashboard/listings/${result.data.id}`);
    } else {
      setError(result.error ?? 'Erreur');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-heading-3 font-bold">Nouvelle annonce</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Remplissez les informations du bien. Vous pourrez ajouter des photos ensuite.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium">Titre de l'annonce</label>
              <Input id="title" name="title" placeholder="Appartement F4 standing — Hydra" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="transaction_type" className="mb-1.5 block text-sm font-medium">Transaction</label>
                <select id="transaction_type" name="transaction_type" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer">
                  <option value="sale">Vente</option>
                  <option value="rent">Location</option>
                  <option value="vacation_rent">Location vacances</option>
                </select>
              </div>
              <div>
                <label htmlFor="property_type" className="mb-1.5 block text-sm font-medium">Type de bien</label>
                <select id="property_type" name="property_type" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer">
                  <option value="apartment">Appartement</option>
                  <option value="house">Maison</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="land">Terrain</option>
                  <option value="commercial">Local commercial</option>
                  <option value="office">Bureau</option>
                  <option value="garage">Garage</option>
                  <option value="warehouse">Entrepôt</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="mb-1.5 block text-sm font-medium">Prix (DA)</label>
                <Input id="price" name="price" type="number" min="0" placeholder="35000000" required />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="negotiable" className="cursor-pointer" />
                  Négociable
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Wilaya</label>
              <WilayaSelector value={wilaya} onChange={setWilaya} required />
            </div>
            <div>
              <label htmlFor="commune" className="mb-1.5 block text-sm font-medium">Commune</label>
              <Input id="commune" name="commune" placeholder="Hydra" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Caractéristiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="surface" className="mb-1.5 block text-sm font-medium">Surface (m²)</label>
                <Input id="surface" name="surface" type="number" min="0" />
              </div>
              <div>
                <label htmlFor="rooms" className="mb-1.5 block text-sm font-medium">Pièces</label>
                <Input id="rooms" name="rooms" type="number" min="0" />
              </div>
              <div>
                <label htmlFor="bedrooms" className="mb-1.5 block text-sm font-medium">Chambres</label>
                <Input id="bedrooms" name="bedrooms" type="number" min="0" />
              </div>
              <div>
                <label htmlFor="bathrooms" className="mb-1.5 block text-sm font-medium">SDB</label>
                <Input id="bathrooms" name="bathrooms" type="number" min="0" />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium">Description</label>
              <Textarea id="description" name="description" rows={5} placeholder="Décrivez le bien..." />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer le brouillon'}
          </Button>
        </div>
      </form>
    </div>
  );
}

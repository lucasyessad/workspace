'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Crown, Image as ImageIcon, Video, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateAgencyBranding, updateAgencyCoverImage } from '@/lib/actions';
import type { Agency } from '@/types';

interface BrandingFormProps {
  agency: Agency;
  canEdit: boolean;
  isEnterprise: boolean;
}

export function BrandingForm({ agency, canEdit, isEnterprise }: BrandingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    const values: Record<string, unknown> = {
      name: formData.get('name') as string,
      slogan: (formData.get('slogan') as string) || null,
      description: (formData.get('description') as string) || null,
      primary_color: formData.get('primary_color') as string,
      phone: (formData.get('phone') as string) || null,
      email: (formData.get('email') as string) || null,
      address: (formData.get('address') as string) || null,
    };

    if (isEnterprise) {
      values.secondary_color = (formData.get('secondary_color') as string) || null;
      values.hero_video_url = (formData.get('hero_video_url') as string) || null;
      values.hero_style = formData.get('hero_style') as string;
      values.font_style = formData.get('font_style') as string;
      values.theme_mode = formData.get('theme_mode') as string;
      values.tagline = (formData.get('tagline') as string) || null;
      const statsYears = formData.get('stats_years') as string;
      const statsSold = formData.get('stats_properties_sold') as string;
      const statsClients = formData.get('stats_clients') as string;
      values.stats_years = statsYears ? Number(statsYears) : null;
      values.stats_properties_sold = statsSold ? Number(statsSold) : null;
      values.stats_clients = statsClients ? Number(statsClients) : null;
    }

    const result = await updateAgencyBranding(values);

    setLoading(false);
    if (result.success) {
      setSuccess(true);
      router.refresh();
    } else {
      setError(result.error ?? 'Erreur');
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const result = await updateAgencyCoverImage(formData);
    setCoverUploading(false);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error ?? 'Erreur lors de l\'upload');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Nom de l&apos;agence</label>
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
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">Telephone</label>
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

      {/* Enterprise luxury section */}
      {isEnterprise && (
        <Card className="mt-6 border-or/30 bg-gradient-to-br from-or/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="h-5 w-5 text-or" />
              Branding Premium
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Options exclusives pour personnaliser votre site vitrine.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cover image upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Image de couverture</label>
              {agency.cover_image_url && (
                <div className="mb-2 overflow-hidden rounded-lg">
                  <img src={agency.cover_image_url} alt="Couverture" className="h-32 w-full object-cover" />
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={coverUploading || !canEdit}
                onClick={() => coverInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {coverUploading ? 'Upload...' : agency.cover_image_url ? 'Changer l\'image' : 'Ajouter une image'}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG. Max 10 Mo. Recommande : 1920x800px</p>
            </div>

            {/* Hero style */}
            <div>
              <label htmlFor="hero_style" className="mb-1.5 block text-sm font-medium">Style du hero</label>
              <select
                id="hero_style"
                name="hero_style"
                defaultValue={agency.hero_style ?? 'cover'}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={!canEdit}
              >
                <option value="color">Couleur unie</option>
                <option value="cover">Image de couverture</option>
                <option value="video">Video en fond</option>
              </select>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ImageIcon className="h-3 w-3" />
                <span>L&apos;image de couverture ou la video seront affichees en plein ecran</span>
              </div>
            </div>

            {/* Video URL */}
            <div>
              <label htmlFor="hero_video_url" className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                <Video className="h-4 w-4" />
                URL de la video hero
              </label>
              <Input
                id="hero_video_url"
                name="hero_video_url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                defaultValue={agency.hero_video_url ?? ''}
                disabled={!canEdit}
              />
              <p className="mt-1 text-xs text-muted-foreground">YouTube ou lien direct vers un fichier MP4</p>
            </div>

            {/* Tagline */}
            <div>
              <label htmlFor="tagline" className="mb-1.5 block text-sm font-medium">Tagline premium</label>
              <Textarea
                id="tagline"
                name="tagline"
                defaultValue={agency.tagline ?? ''}
                rows={2}
                placeholder="Votre partenaire immobilier de confiance depuis 2010..."
                disabled={!canEdit}
              />
              <p className="mt-1 text-xs text-muted-foreground">Texte affiche sous le nom de l&apos;agence dans le hero</p>
            </div>

            {/* Colors & Style */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="secondary_color" className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4" />
                  Couleur secondaire
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="secondary_color"
                    name="secondary_color"
                    defaultValue={agency.secondary_color ?? '#b8963e'}
                    className="h-10 w-10 cursor-pointer rounded border"
                    disabled={!canEdit}
                  />
                  <span className="text-xs text-muted-foreground">Accents & decorations</span>
                </div>
              </div>

              <div>
                <label htmlFor="font_style" className="mb-1.5 block text-sm font-medium">Typographie</label>
                <select
                  id="font_style"
                  name="font_style"
                  defaultValue={agency.font_style ?? 'elegant'}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={!canEdit}
                >
                  <option value="modern">Modern (Jakarta)</option>
                  <option value="classic">Classic (Playfair Display)</option>
                  <option value="elegant">Elegant (Mixte)</option>
                </select>
              </div>
            </div>

            {/* Theme mode */}
            <div>
              <label htmlFor="theme_mode" className="mb-1.5 block text-sm font-medium">Ambiance du site</label>
              <select
                id="theme_mode"
                name="theme_mode"
                defaultValue={agency.theme_mode ?? 'dark'}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={!canEdit}
              >
                <option value="dark">Sombre (Luxe — fond bleu nuit)</option>
                <option value="light">Clair (Fond blanc elegant)</option>
              </select>
            </div>

            {/* Statistics */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Chiffres cles</label>
              <p className="mb-2 text-xs text-muted-foreground">Affiches dans le hero et la page A propos</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="stats_years" className="mb-1 block text-xs text-muted-foreground">Annees d&apos;experience</label>
                  <Input
                    id="stats_years"
                    name="stats_years"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={agency.stats_years ?? ''}
                    placeholder="15"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label htmlFor="stats_properties_sold" className="mb-1 block text-xs text-muted-foreground">Biens vendus/loues</label>
                  <Input
                    id="stats_properties_sold"
                    name="stats_properties_sold"
                    type="number"
                    min={0}
                    defaultValue={agency.stats_properties_sold ?? ''}
                    placeholder="500"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label htmlFor="stats_clients" className="mb-1 block text-xs text-muted-foreground">Clients satisfaits</label>
                  <Input
                    id="stats_clients"
                    name="stats_clients"
                    type="number"
                    min={0}
                    defaultValue={agency.stats_clients ?? ''}
                    placeholder="1000"
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-success">Branding mis a jour.</p>}

      {canEdit && (
        <Button type="submit" disabled={loading}>
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      )}
    </form>
  );
}

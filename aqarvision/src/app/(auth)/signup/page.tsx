'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WilayaSelector } from '@/components/algeria/wilaya-selector';
import { signup } from '@/lib/actions';

export default function SignupPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [wilaya, setWilaya] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await signup({
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      agency_name: formData.get('agency_name') as string,
      phone: formData.get('phone') as string,
      wilaya,
    });

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Erreur lors de la création');
    }
  }

  return (
    <div>
      <h2 className="text-heading-2 font-bold text-bleu-nuit">Créer mon agence</h2>
      <p className="mt-2 text-body-sm text-muted-foreground">
        Lancez votre présence en ligne en quelques minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium">Votre nom complet</label>
          <Input id="full_name" name="full_name" placeholder="Mohamed Benali" required />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
          <Input id="email" name="email" type="email" placeholder="votre@email.dz" required />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Mot de passe</label>
          <Input id="password" name="password" type="password" placeholder="Minimum 8 caractères" required />
        </div>

        <hr className="my-2" />

        <div>
          <label htmlFor="agency_name" className="mb-1.5 block text-sm font-medium">Nom de l'agence</label>
          <Input id="agency_name" name="agency_name" placeholder="Immobilière El Djazair" required />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">Téléphone</label>
          <Input id="phone" name="phone" type="tel" placeholder="+213 555 12 34 56" required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Wilaya</label>
          <WilayaSelector value={wilaya} onChange={setWilaya} required />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" variant="or" disabled={loading}>
          {loading ? 'Création...' : 'Créer mon agence'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Déjà inscrit ?{' '}
        <Link href="/login" className="font-medium text-bleu-nuit hover:underline cursor-pointer">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

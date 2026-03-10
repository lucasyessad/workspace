'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/actions';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await login({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Erreur de connexion');
    }
  }

  return (
    <div>
      <h2 className="text-heading-2 font-bold text-bleu-nuit">Connexion</h2>
      <p className="mt-2 text-body-sm text-muted-foreground">
        Accédez au tableau de bord de votre agence.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
          <Input id="email" name="email" type="email" placeholder="votre@email.dz" required />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Mot de passe</label>
          <Input id="password" name="password" type="password" placeholder="Votre mot de passe" required />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link href="/signup" className="font-medium text-bleu-nuit hover:underline cursor-pointer">
          Créer mon agence
        </Link>
      </p>
    </div>
  );
}

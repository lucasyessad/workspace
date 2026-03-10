'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrength } from '@/components/auth/password-strength';
import { createBrowserClient } from '@/lib/supabase/client';

export default function VisitorSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [acceptCgu, setAcceptCgu] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!acceptCgu) {
      setError('Veuillez accepter les conditions d\'utilisation.');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const fullName = formData.get('full_name') as string;

    const supabase = createBrowserClient();

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'agency_editor',
          account_type: 'visitor',
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    setLoading(false);
    if (signupError) {
      setError(signupError.message);
    } else {
      router.push('/verification?email=' + encodeURIComponent(email));
    }
  }

  return (
    <div>
      <h2 className="text-heading-3 font-bold text-bleu-nuit">Créer un compte</h2>
      <p className="mt-2 text-body-sm text-muted-foreground">
        Créez un compte pour sauvegarder vos favoris, recevoir des alertes et contacter les agences.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium">Nom complet</label>
          <Input id="full_name" name="full_name" placeholder="Votre nom" required />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
          <Input id="email" name="email" type="email" placeholder="votre@email.dz" required />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Mot de passe</label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 8 caractères"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrength password={password} />
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptCgu}
            onChange={(e) => setAcceptCgu(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-input"
          />
          <span className="text-xs text-muted-foreground">
            J'accepte les{' '}
            <Link href="#" className="text-or hover:underline">conditions d'utilisation</Link>
            {' '}et la{' '}
            <Link href="#" className="text-or hover:underline">politique de confidentialité</Link>
          </span>
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" variant="or" disabled={loading || !acceptCgu}>
          {loading ? 'Création...' : 'Créer mon compte'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Déjà inscrit ?{' '}
        <Link href="/login" className="font-medium text-bleu-nuit hover:underline cursor-pointer">
          Se connecter
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Vous êtes une agence ?{' '}
        <Link href="/signup" className="font-medium text-or hover:underline cursor-pointer">
          Créer un compte agence
        </Link>
      </p>
    </div>
  );
}

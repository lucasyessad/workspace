'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@/lib/supabase/client';

export default function VerificationPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    if (!searchParams.email) return;
    setResending(true);
    const supabase = createBrowserClient();
    await supabase.auth.resend({
      type: 'signup',
      email: searchParams.email,
    });
    setResending(false);
    setResent(true);
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-or/10">
        <Mail className="h-8 w-8 text-or" />
      </div>
      <h2 className="text-heading-3 font-bold text-bleu-nuit">Vérifiez votre email</h2>
      <p className="mt-3 text-body-sm text-muted-foreground">
        Un email de confirmation a été envoyé à{' '}
        {searchParams.email && <strong>{searchParams.email}</strong>}.
        Cliquez sur le lien dans l'email pour activer votre compte.
      </p>

      <div className="mt-8 space-y-3">
        {searchParams.email && (
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resending || resent}
            className="w-full"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
            {resent ? 'Email renvoyé !' : resending ? 'Envoi...' : 'Renvoyer l\'email'}
          </Button>
        )}
        <Button variant="outline" asChild className="w-full">
          <Link href="/login">Retour à la connexion</Link>
        </Button>
      </div>

      {resent && (
        <p className="mt-4 text-xs text-muted-foreground">
          Si vous ne recevez rien, vérifiez votre dossier spam.
        </p>
      )}
    </div>
  );
}

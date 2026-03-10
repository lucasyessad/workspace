'use client';

import { useState } from 'react';
import { Phone, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { submitPropertyInquiry } from '@/lib/actions';
import type { Agency } from '@/types';

interface LeadContactPanelProps {
  agency: Agency;
  agencyId: string;
  propertyId?: string;
}

export function LeadContactPanel({ agency, agencyId, propertyId }: LeadContactPanelProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await submitPropertyInquiry({
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      email: (formData.get('email') as string) || undefined,
      message: (formData.get('message') as string) || undefined,
      request_type: 'info_request',
      agency_id: agencyId,
      property_id: propertyId,
    });

    setSending(false);
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error ?? 'Erreur');
    }
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Send className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="font-semibold">Message envoyé</p>
          <p className="mt-1 text-sm text-muted-foreground">
            L'agence vous contactera bientôt.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Contacter l'agence</CardTitle>
        {agency.phone && (
          <a
            href={`tel:${agency.phone}`}
            className="flex items-center gap-2 text-sm text-or hover:underline cursor-pointer"
          >
            <Phone className="h-4 w-4" />
            {agency.phone}
          </a>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="full_name" placeholder="Votre nom *" required />
          <Input name="phone" type="tel" placeholder="Votre téléphone *" required />
          <Input name="email" type="email" placeholder="Votre email" />
          <Textarea name="message" placeholder="Votre message..." rows={3} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={sending}>
            {sending ? 'Envoi...' : 'Envoyer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

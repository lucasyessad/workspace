'use client';

import { Phone, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StickyContactCTAProps {
  phone: string | null;
  agencyId: string;
  propertyId: string;
  price: string;
}

export function StickyContactCTA({ phone, agencyId, propertyId, price }: StickyContactCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white p-3 shadow-float lg:hidden">
      <div className="container flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-bleu-nuit">{price}</p>
        </div>
        <div className="flex items-center gap-2">
          {phone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${phone}`} className="cursor-pointer">
                <Phone className="mr-1.5 h-4 w-4" />
                Appeler
              </a>
            </Button>
          )}
          <Button variant="or" size="sm" asChild>
            <a href="#contact-form" className="cursor-pointer">
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Contacter
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

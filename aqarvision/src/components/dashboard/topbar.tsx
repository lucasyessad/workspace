import Link from 'next/link';
import { Bell, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Agency, UserProfile } from '@/types';
import { ROLE_LABELS } from '@/lib/permissions';

interface TopbarProps {
  agency: Agency;
  profile: UserProfile;
}

export function DashboardTopbar({ agency, profile }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-medium text-muted-foreground">
          {ROLE_LABELS[profile.role]}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={`/agence/${agency.slug}`}
            target="_blank"
            className="flex items-center gap-2"
          >
            Voir le site
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
        </Button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bleu-nuit text-xs font-bold text-white">
          {profile.full_name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

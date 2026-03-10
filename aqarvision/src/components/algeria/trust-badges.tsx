import { ShieldCheck, BadgeCheck, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedAgencyBadgeProps {
  className?: string;
}

export function VerifiedAgencyBadge({ className }: VerifiedAgencyBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700', className)}>
      <ShieldCheck className="h-4 w-4" />
      Agence vérifiée
    </span>
  );
}

export function VerifiedListingBadge({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-blue-700', className)}>
      <BadgeCheck className="h-4 w-4" />
      Annonce vérifiée
    </span>
  );
}

export function OfficialAgencyBadge({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-or', className)}>
      <Award className="h-4 w-4" />
      Agence officielle
    </span>
  );
}

export function TrustBadgeGroup({ isVerified, licenseNumber }: { isVerified: boolean; licenseNumber?: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {isVerified && <VerifiedAgencyBadge />}
      {licenseNumber && <OfficialAgencyBadge />}
    </div>
  );
}

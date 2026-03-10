import { Badge } from '@/components/ui/badge';
import { LEAD_STATUS_LABELS } from '@/lib/constants';
import type { LeadStatus } from '@/types';

const STATUS_VARIANTS: Record<LeadStatus, 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive'> = {
  new: 'info',
  contacted: 'secondary',
  qualified: 'warning',
  visit_scheduled: 'warning',
  negotiation: 'default',
  converted: 'success',
  lost: 'destructive',
};

interface LeadStatusChipProps {
  status: LeadStatus;
}

export function LeadStatusChip({ status }: LeadStatusChipProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {LEAD_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

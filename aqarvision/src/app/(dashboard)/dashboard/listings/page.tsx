import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { getAgencyProperties } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PROPERTY_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import { formatPrice, formatRelativeDate } from '@/lib/formatters';

export const metadata = { title: 'Annonces' };

export default async function ListingsPage() {
  const tenant = await requirePermission('properties:read');
  const result = await getAgencyProperties();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 font-bold">Annonces</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            {result.total} annonce{result.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle annonce
          </Link>
        </Button>
      </div>

      {result.data.length === 0 ? (
        <EmptyState
          title="Aucune annonce"
          description="Commencez par créer votre première annonce immobilière."
          action={
            <Button asChild>
              <Link href="/dashboard/listings/new">Créer une annonce</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Titre</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Prix</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((property) => (
                <tr key={property.id} className="border-b transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/listings/${property.id}`}
                      className="font-medium hover:underline cursor-pointer"
                    >
                      {property.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{property.wilaya}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {TRANSACTION_TYPE_LABELS[property.transaction_type]}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatPrice(property.price, property.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={property.status === 'published' ? 'success' : 'outline'}>
                      {PROPERTY_STATUS_LABELS[property.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatRelativeDate(property.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

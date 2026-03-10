'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleFavorite } from '@/lib/actions/favorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  propertyId: string;
  isFavorited: boolean;
  className?: string;
  variant?: 'icon' | 'full';
}

export function FavoriteButton({
  propertyId,
  isFavorited: initialFavorited,
  className,
  variant = 'icon',
}: FavoriteButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleFavorite(propertyId);
    setLoading(false);
    if (result.success && result.data) {
      setFavorited(result.data.isFavorited);
      router.refresh();
    }
  }

  if (variant === 'full') {
    return (
      <Button
        variant="outline"
        onClick={handleToggle}
        disabled={loading}
        className={cn('gap-2', className)}
      >
        <Heart className={cn('h-4 w-4', favorited && 'fill-favorite text-favorite')} />
        {favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      </Button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      disabled={loading}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white cursor-pointer',
        className
      )}
      title={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          favorited ? 'fill-favorite text-favorite' : 'text-muted-foreground'
        )}
      />
    </button>
  );
}

import { formatPrice } from '@/lib/formatters';

interface DZDFormatterProps {
  amount: number;
  perMonth?: boolean;
  className?: string;
}

export function DZDFormatter({ amount, perMonth, className }: DZDFormatterProps) {
  return <span className={className}>{formatPrice(amount, 'DZD', perMonth)}</span>;
}

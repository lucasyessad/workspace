import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-bleu-nuit lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-or" />
          <h1 className="mt-4 font-display text-heading-2 text-white">AqarVision</h1>
          <p className="mt-2 max-w-xs text-body text-white/60">
            La plateforme immobilière premium pour les agences algériennes.
          </p>
        </div>
      </div>
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Building2 className="h-6 w-6 text-bleu-nuit" />
              <span className="font-display text-lg font-bold text-bleu-nuit">AqarVision</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

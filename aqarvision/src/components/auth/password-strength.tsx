'use client';

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Faible', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Moyen', color: 'bg-orange-500' };
  if (score <= 3) return { score, label: 'Bon', color: 'bg-yellow-500' };
  return { score, label: 'Fort', color: 'bg-emerald-500' };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, label, color } = getStrength(password);
  const percentage = (score / 5) * 100;

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Sécurité : <span className="font-medium">{label}</span>
      </p>
    </div>
  );
}

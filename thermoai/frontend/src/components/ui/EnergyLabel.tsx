import { cn, ENERGY_LABEL_COLORS } from "@/lib/utils";

interface EnergyLabelProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function EnergyLabel({ label, size = "md", className }: EnergyLabelProps) {
  if (!label) return <span className="text-gray-400">—</span>;

  const sizeClasses = {
    sm: "w-7 h-7 text-xs font-bold",
    md: "w-9 h-9 text-sm font-bold",
    lg: "w-14 h-14 text-xl font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md",
        ENERGY_LABEL_COLORS[label] ?? "bg-gray-300 text-gray-700",
        sizeClasses[size],
        className
      )}
    >
      {label}
    </span>
  );
}

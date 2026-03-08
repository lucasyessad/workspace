import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: number;
  color?: "blue" | "green" | "orange" | "red";
  className?: string;
}

const colorMap = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
};

export default function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  color = "blue",
  className,
}: StatCardProps) {
  return (
    <div className={cn("card p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value}
            {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
          </p>
        </div>
        {Icon && (
          <div className={cn("p-2 rounded-lg", colorMap[color])}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

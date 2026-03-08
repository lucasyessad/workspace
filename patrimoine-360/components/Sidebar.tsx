"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useState } from "react";
import { modules } from "@/lib/modules";

interface SidebarProps {
  completedModules: number[];
}

export default function Sidebar({ completedModules }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={`hidden md:flex flex-col border-r border-white/[0.08] bg-[#0B0F1A] transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="p-3 flex items-center justify-between border-b border-white/[0.08]">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 text-white hover:text-indigo-400 transition">
            <Home size={18} />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {modules.map((m) => {
          const isActive = pathname === `/module/${m.id}`;
          const isComplete = completedModules.includes(m.id);
          return (
            <Link
              key={m.id}
              href={`/module/${m.id}`}
              className={`flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg transition text-sm ${
                isActive
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span className="text-base flex-shrink-0">{m.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{m.title}</span>
                  {isComplete && <span className="text-green-400 text-xs">&#10003;</span>}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

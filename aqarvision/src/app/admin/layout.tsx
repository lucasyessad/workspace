import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  BarChart3,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/** Layout admin avec sidebar de navigation */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Vérifier le rôle admin via service role
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: admin } = await serviceClient
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!admin) {
    redirect("/dashboard");
  }

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { href: "/admin/users", icon: Users, label: "Utilisateurs" },
    { href: "/admin/verifications", icon: FileCheck, label: "Vérifications" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-blanc-casse flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bleu-nuit text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-or" />
            <span className="text-lg font-bold">
              Admin <span className="text-or">Panel</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 capitalize">{admin.role}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

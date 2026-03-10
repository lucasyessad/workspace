import { requireAuth } from '@/lib/auth/guard';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardTopbar } from '@/components/dashboard/topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await requireAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar agency={tenant.agency} userRole={tenant.profile.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar agency={tenant.agency} profile={tenant.profile} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}

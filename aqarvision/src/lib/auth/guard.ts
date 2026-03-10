import { redirect } from 'next/navigation';
import { resolveAuthenticatedTenant, type AuthenticatedTenant } from '@/lib/tenant/resolve';
import { hasPermission, type Permission } from '@/lib/permissions';

/**
 * Require authentication and tenant resolution.
 * Redirects to /login if not authenticated.
 */
export async function requireAuth(): Promise<AuthenticatedTenant> {
  const tenant = await resolveAuthenticatedTenant();
  if (!tenant) {
    redirect('/login');
  }
  return tenant;
}

/**
 * Require a specific permission.
 * Redirects to /dashboard if authenticated but unauthorized.
 */
export async function requirePermission(permission: Permission): Promise<AuthenticatedTenant> {
  const tenant = await requireAuth();
  if (!hasPermission(tenant.profile.role, permission)) {
    redirect('/dashboard');
  }
  return tenant;
}

/**
 * Require platform super admin access.
 * Redirects to /dashboard if not a super admin.
 */
export async function requirePlatformAdmin(): Promise<AuthenticatedTenant> {
  const tenant = await requireAuth();
  if (tenant.profile.role !== 'platform_super_admin') {
    redirect('/dashboard');
  }
  return tenant;
}

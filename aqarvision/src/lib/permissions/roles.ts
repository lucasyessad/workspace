import type { UserRole } from '@/types';

// ============================================================================
// Permission system — role-based, explicit, no magic
// ============================================================================

export type Permission =
  // Properties
  | 'properties:create'
  | 'properties:read'
  | 'properties:update'
  | 'properties:delete'
  | 'properties:publish'
  // Leads
  | 'leads:read'
  | 'leads:create'
  | 'leads:update'
  | 'leads:delete'
  // Team
  | 'team:read'
  | 'team:invite'
  | 'team:remove'
  | 'team:update_role'
  // Branding
  | 'branding:read'
  | 'branding:update'
  // Subscription
  | 'subscription:read'
  | 'subscription:manage'
  // Agency settings
  | 'settings:read'
  | 'settings:update'
  // Admin
  | 'admin:access'
  | 'admin:manage_agencies'
  | 'admin:manage_subscriptions';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  platform_super_admin: [
    'properties:create', 'properties:read', 'properties:update', 'properties:delete', 'properties:publish',
    'leads:read', 'leads:create', 'leads:update', 'leads:delete',
    'team:read', 'team:invite', 'team:remove', 'team:update_role',
    'branding:read', 'branding:update',
    'subscription:read', 'subscription:manage',
    'settings:read', 'settings:update',
    'admin:access', 'admin:manage_agencies', 'admin:manage_subscriptions',
  ],
  agency_owner: [
    'properties:create', 'properties:read', 'properties:update', 'properties:delete', 'properties:publish',
    'leads:read', 'leads:create', 'leads:update', 'leads:delete',
    'team:read', 'team:invite', 'team:remove', 'team:update_role',
    'branding:read', 'branding:update',
    'subscription:read', 'subscription:manage',
    'settings:read', 'settings:update',
  ],
  agency_admin: [
    'properties:create', 'properties:read', 'properties:update', 'properties:delete', 'properties:publish',
    'leads:read', 'leads:create', 'leads:update',
    'team:read', 'team:invite',
    'branding:read', 'branding:update',
    'subscription:read',
    'settings:read',
  ],
  agency_editor: [
    'properties:create', 'properties:read', 'properties:update',
    'leads:read',
    'branding:read',
    'subscription:read',
    'settings:read',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if a role can invite another role.
 * Owner can invite admin/editor. Admin can invite editor only.
 */
export function canInviteRole(inviterRole: UserRole, targetRole: UserRole): boolean {
  if (inviterRole === 'platform_super_admin') return true;
  if (inviterRole === 'agency_owner') {
    return targetRole === 'agency_admin' || targetRole === 'agency_editor';
  }
  if (inviterRole === 'agency_admin') {
    return targetRole === 'agency_editor';
  }
  return false;
}

export function isPlatformRole(role: UserRole): boolean {
  return role === 'platform_super_admin';
}

export function isAgencyRole(role: UserRole): boolean {
  return role === 'agency_owner' || role === 'agency_admin' || role === 'agency_editor';
}

/** Role hierarchy for display */
export const ROLE_LABELS: Record<UserRole, string> = {
  platform_super_admin: 'Super Admin',
  agency_owner: 'Propriétaire',
  agency_admin: 'Administrateur',
  agency_editor: 'Éditeur',
};

export const ROLE_HIERARCHY: UserRole[] = [
  'platform_super_admin',
  'agency_owner',
  'agency_admin',
  'agency_editor',
];

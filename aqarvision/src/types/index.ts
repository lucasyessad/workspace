export * from './database';

// ============================================================================
// App-level types
// ============================================================================

export interface TenantContext {
  agencyId: string;
  agencySlug: string;
  userId: string;
  userRole: import('./database').UserRole;
}

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface PropertyFilters {
  transactionType?: import('./database').TransactionType;
  propertyType?: import('./database').PropertyType;
  wilaya?: string;
  commune?: string;
  priceMin?: number;
  priceMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  rooms?: number;
  bedrooms?: number;
  status?: import('./database').PropertyStatus;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

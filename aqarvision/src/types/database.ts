// ============================================================================
// Database types — mirrors the Supabase schema
// Generated from 0001_initial_schema.sql
// ============================================================================

export type UserRole =
  | 'platform_super_admin'
  | 'agency_owner'
  | 'agency_admin'
  | 'agency_editor';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export type PropertyStatus = 'draft' | 'published' | 'archived' | 'sold' | 'rented';

export type TransactionType = 'sale' | 'rent' | 'vacation_rent';

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'villa'
  | 'studio'
  | 'land'
  | 'commercial'
  | 'office'
  | 'garage'
  | 'warehouse'
  | 'other';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'visit_scheduled'
  | 'negotiation'
  | 'converted'
  | 'lost';

export type LeadSource =
  | 'website'
  | 'phone'
  | 'walk_in'
  | 'referral'
  | 'social_media'
  | 'other';

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';

export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise';

export type BillingMode = 'manual' | 'online';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export type ContactRequestType =
  | 'visit_request'
  | 'info_request'
  | 'general_contact'
  | 'callback_request';

export type BillingEventType =
  | 'payment_received'
  | 'plan_activated'
  | 'plan_renewed'
  | 'plan_cancelled'
  | 'plan_upgraded'
  | 'plan_downgraded'
  | 'trial_started'
  | 'trial_ended';

// ============================================================================
// Table row types
// ============================================================================

export type HeroStyle = 'color' | 'cover' | 'video';
export type FontStyle = 'modern' | 'classic' | 'elegant';
export type ThemeMode = 'light' | 'dark';

export interface Agency {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  slogan: string | null;
  description: string | null;
  primary_color: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  wilaya: string | null;
  license_number: string | null;
  is_verified: boolean;
  active_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  custom_domain: string | null;
  // Luxury branding fields (Enterprise only)
  secondary_color: string | null;
  hero_video_url: string | null;
  hero_style: HeroStyle;
  font_style: FontStyle;
  theme_mode: ThemeMode;
  tagline: string | null;
  stats_years: number | null;
  stats_properties_sold: number | null;
  stats_clients: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  agency_id: string | null;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  avatar_url: string | null;
  invited_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  agency_id: string;
  responsible_user_id: string | null;
  title: string;
  slug: string;
  transaction_type: TransactionType;
  property_type: PropertyType;
  price: number;
  currency: string;
  negotiable: boolean;
  surface: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  wilaya: string;
  commune: string | null;
  quartier: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  amenities: string[];
  status: PropertyStatus;
  is_featured: boolean;
  is_verified: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  agency_id: string;
  storage_path: string;
  public_url: string | null;
  alt_text: string;
  sort_order: number;
  created_at: string;
}

export interface Lead {
  id: string;
  agency_id: string;
  property_id: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: LeadStatus;
  source: LeadSource;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencyInvitation {
  id: string;
  agency_id: string;
  email: string;
  role: UserRole;
  token_hash: string;
  status: InvitationStatus;
  invited_by: string | null;
  expires_at: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  agency_id: string;
  plan_code: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_mode: BillingMode;
  start_date: string;
  renewal_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingEvent {
  id: string;
  subscription_id: string;
  agency_id: string;
  type: BillingEventType;
  label: string;
  amount: number | null;
  currency: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
}

export interface ContactRequest {
  id: string;
  agency_id: string | null;
  property_id: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  message: string | null;
  request_type: ContactRequestType;
  created_at: string;
}

export interface AuditLog {
  id: string;
  agency_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ============================================================================
// Messaging & Visitor types (from 0004 migration)
// ============================================================================

export type ConversationStatus = 'open' | 'pending' | 'closed';
export type ParticipantType = 'visitor' | 'agency_member';
export type MessageType = 'text' | 'system';
export type SenderType = 'visitor' | 'agency_member' | 'system';
export type AlertFrequency = 'instant' | 'daily' | 'weekly';
export type AccountType = 'agency' | 'visitor';

export interface Conversation {
  id: string;
  agency_id: string;
  property_id: string | null;
  visitor_user_id: string | null;
  lead_id: string | null;
  subject: string | null;
  status: ConversationStatus;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string | null;
  participant_type: ParticipantType;
  last_read_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: SenderType;
  sender_user_id: string | null;
  body: string;
  message_type: MessageType;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, unknown>;
  frequency: AlertFrequency;
  is_active: boolean;
  last_notified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisitorProfile {
  id: string;
  budget_min: number | null;
  budget_max: number | null;
  preferred_wilayas: string[];
  preferred_types: PropertyType[];
  transaction_preference: TransactionType | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Composite / join types
// ============================================================================

export interface PropertyWithImages extends Property {
  images: PropertyImage[];
}

export interface PropertyWithAgency extends Property {
  agency: Pick<Agency, 'id' | 'name' | 'slug' | 'logo_url' | 'is_verified'>;
}

export interface LeadWithProperty extends Lead {
  property: Pick<Property, 'id' | 'title' | 'slug'> | null;
}

export interface ConversationWithDetails extends Conversation {
  agency: Pick<Agency, 'id' | 'name' | 'slug' | 'logo_url'>;
  property: Pick<Property, 'id' | 'title' | 'slug'> | null;
  last_message: Pick<Message, 'body' | 'sender_type' | 'created_at'> | null;
  unread_count: number;
}

export interface PropertyWithAgencyAndImages extends Property {
  agency: Pick<Agency, 'id' | 'name' | 'slug' | 'logo_url' | 'is_verified' | 'phone' | 'license_number'>;
  images: PropertyImage[];
}

export interface FavoriteWithProperty extends Favorite {
  property: PropertyWithAgency;
}

// Enums
export type UserRole = 'representative' | 'leader';
export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost';
export type EventType = 'created' | 'assigned' | 'called' | 'whatsapp' | 'status_changed';

// User
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  leader_id: string | null;
  region: string;
  is_active: boolean;
  fcm_token: string;
  ad_credits?: number;
}

// Lead
export interface Lead {
  id: string;
  full_name: string;
  phone: string;
  city: string;
  form_time: string;
  assigned_to: string;
  status: LeadStatus;
  assigned_at: string;
  meta_lead_id: string;
  form_data: {
    source: string;
    campaign: string;
  };
}

// Lead Event
export interface LeadEvent {
  id: string;
  lead_id: string;
  event_type: EventType;
  actor_id: string | null;
  metadata: Record<string, any>;
  timestamp: string;
}

// Performance Summary
export interface PerformanceSummary {
  id: string;
  user_id: string;
  date: string;
  total_leads: number;
  contacted_leads: number;
  converted_leads: number;
  lost_leads: number;
  avg_response_minutes: number;
  sales_ratio: number;
}

// Dashboard KPIs
export interface DashboardKPIs {
  total_leads: number;
  contacted_leads: number;
  converted_leads: number;
  avg_response_minutes: number;
  sales_ratio: number;
}

// Team Performance
export interface TeamPerformance {
  representative_id: string;
  representative_name: string;
  total_leads: number;
  contacted_leads: number;
  converted_leads: number;
  avg_response_minutes: number;
  sales_ratio: number;
  ad_credits?: number;
}

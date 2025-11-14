import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Normalize phone number to international format (+90...)
 * Handles various formats: 05xx, +905xx, 905xx, +90 5xx, etc.
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, '');
  
  // If starts with 90, it's already country code
  if (cleaned.startsWith('90')) {
    return `+${cleaned}`;
  }
  
  // If it's 10 digits (5xxxxxxxxx), add country code
  if (cleaned.length === 10 && cleaned.startsWith('5')) {
    return `+90${cleaned}`;
  }
  
  // If it's 11 digits starting with 0 (05xxxxxxxxx), remove 0 and add country code
  if (cleaned.length === 11 && cleaned.startsWith('05')) {
    return `+90${cleaned.slice(1)}`;
  }
  
  // Default: assume it needs +90 prefix
  return `+90${cleaned}`;
}

/**
 * Format phone number for display (masked)
 * Format: 05xx *** 67 89
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 10) return phone;
  
  // Normalize first
  const normalized = normalizePhoneNumber(phone);
  const cleaned = normalized.replace(/\D/g, '');
  
  // Format: 0xxx *** xx xx (Turkish format)
  if (cleaned.length === 12 && cleaned.startsWith('90')) {
    const local = cleaned.slice(2); // Remove 90
    return `0${local.slice(0, 3)} *** ${local.slice(6, 8)} ${local.slice(8)}`;
  }
  
  return phone;
}

// Date formatting
export function formatDate(date: string | Date, formatStr: string = 'dd MMM yyyy HH:mm'): string {
  try {
    return format(new Date(date), formatStr, { locale: tr });
  } catch {
    return '';
  }
}

// Relative time (e.g., "2 saat önce")
export function formatRelativeTime(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: tr });
  } catch {
    return '';
  }
}

// Calculate response time in minutes
export function calculateResponseTime(assignedAt: string, calledAt: string): number {
  try {
    const assigned = new Date(assignedAt).getTime();
    const called = new Date(calledAt).getTime();
    return Math.round((called - assigned) / (1000 * 60));
  } catch {
    return 0;
  }
}

// Status badge colors
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    converted: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Status labels in Turkish
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: 'Yeni',
    contacted: 'Görüşüldü',
    converted: 'Satış',
    lost: 'Kayıp',
  };
  return labels[status] || status;
}

// Event type labels in Turkish
export function getEventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    created: 'Lead Oluşturuldu',
    assigned: 'Atandı',
    called: 'Arandı',
    whatsapp: 'WhatsApp Gönderildi',
    status_changed: 'Durum Değişti',
  };
  return labels[eventType] || eventType;
}

// Format percentage
export function formatPercentage(value: number): string {
  return `%${value.toFixed(1)}`;
}

// Format minutes to readable time
export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} dk`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}s ${mins}dk`;
}

// Tailwind CSS class merger (simple version)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// Phone number masking
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 10) return phone;
  
  // Format: 05xx *** 67 89
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} *** ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
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

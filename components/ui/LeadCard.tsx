'use client';

import Link from 'next/link';
import { Phone, MessageCircle, Clock, MapPin } from 'lucide-react';
import { Lead } from '@/types';
import { maskPhoneNumber, normalizePhoneNumber, formatRelativeTime, getStatusLabel, getStatusColor } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  href: string;
}

export function LeadCard({ lead, href }: LeadCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-98 overflow-hidden"
    >
      {/* Status Bar */}
      <div className={`h-1 ${
        lead.status === 'new' ? 'bg-blue-500' :
        lead.status === 'contacted' ? 'bg-yellow-500' :
        lead.status === 'converted' ? 'bg-green-500' :
        'bg-red-500'
      }`} />
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {lead.full_name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{lead.city}</span>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(lead.assigned_at)}</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
              lead.status
            )}`}
          >
            {getStatusLabel(lead.status)}
          </span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2 mb-4 text-gray-700">
          <Phone className="w-4 h-4 text-primary-600" />
          <span className="font-mono text-sm">{maskPhoneNumber(lead.phone)}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={(e) => {
              e.preventDefault();
              const normalizedPhone = normalizePhoneNumber(lead.phone);
              window.location.href = `tel:${normalizedPhone}`;
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
          >
            <Phone className="w-5 h-5" />
            Ara
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              const normalizedPhone = normalizePhoneNumber(lead.phone);
              // WhatsApp format: remove + sign
              const whatsappNumber = normalizedPhone.replace('+', '');
              window.open(`https://wa.me/${whatsappNumber}`, '_blank');
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-sm"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </button>
        </div>
      </div>
    </Link>
  );
}

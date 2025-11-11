'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockApi } from '@/lib/mock-data';
import { Lead } from '@/types';
import { maskPhoneNumber, formatRelativeTime, getStatusLabel, getStatusColor } from '@/lib/utils';
import { Phone, MessageCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';

export default function RepresentativePage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('hll_user_role');
    if (!role || role !== 'representative') {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const leadsData = await mockApi.getLeadsByAssignedTo('1');
        setLeads(leadsData as Lead[]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const newLeads = leads.filter(l => l.status === 'new').length;
  const contactedLeads = leads.filter(l => l.status === 'contacted').length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <MobileHeader
        title="Ayşe Yılmaz"
        subtitle="Temsilci Paneli"
        stats={[
          { label: 'Yeni', value: newLeads },
          { label: 'Görüşülen', value: contactedLeads },
          { label: 'Satış', value: convertedLeads },
        ]}
      />

      {/* Lead List */}
      <div className="px-4 py-6 space-y-4">
        {leads.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Henüz lead bulunmuyor</p>
            <p className="text-gray-400 text-sm mt-2">Yeni lead'ler burada görünecek</p>
          </div>
        ) : (
          leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/representative/leads/${lead.id}`}
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
                      <span>{lead.city}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(lead.assigned_at)}
                      </span>
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
                      window.location.href = `tel:${lead.phone}`;
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
                  >
                    <Phone className="w-5 h-5" />
                    Ara
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <BottomNav role="representative" />
    </div>
  );
}

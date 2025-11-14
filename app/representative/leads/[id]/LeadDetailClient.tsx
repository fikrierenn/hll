'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockApi } from '@/lib/mock-data';
import { Lead, LeadEvent } from '@/types';
import { formatDate, getStatusColor, getStatusLabel, getEventTypeLabel } from '@/lib/utils';
import { ArrowLeft, Phone, MessageCircle, Clock, CheckCircle2, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface LeadDetailClientProps {
  leadId: string;
}

export default function LeadDetailClient({ leadId }: LeadDetailClientProps) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('hll_user_role');
    if (!role || role !== 'representative') {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const leadData = await mockApi.getLeadById(leadId);
        const eventsData = await mockApi.getLeadEventsByLeadId(leadId);
        
        if (leadData) {
          setLead(leadData as Lead);
          setEvents(eventsData as LeadEvent[]);
        } else {
          toast.error('Lead bulunamadı');
          router.push('/representative');
        }
      } catch (error) {
        console.error('Error loading lead:', error);
        toast.error('Lead yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [leadId, router]);

  const handleCall = async () => {
    if (!lead) return;
    
    setActionLoading(true);
    try {
      await mockApi.createLeadEvent({
        lead_id: lead.id,
        event_type: 'called',
        actor_id: '1',
        metadata: {}
      });
      
      const eventsData = await mockApi.getLeadEventsByLeadId(lead.id);
      setEvents(eventsData as LeadEvent[]);
      
      window.location.href = `tel:${lead.phone}`;
      toast.success('Arama kaydedildi');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!lead) return;
    
    setActionLoading(true);
    try {
      await mockApi.createLeadEvent({
        lead_id: lead.id,
        event_type: 'whatsapp',
        actor_id: '1',
        metadata: { message_sent: true }
      });
      
      const eventsData = await mockApi.getLeadEventsByLeadId(lead.id);
      setEvents(eventsData as LeadEvent[]);
      
      const message = encodeURIComponent('Merhaba, HommLink Lead sisteminden ulaşıyorum.');
      window.open(`https://wa.me/${lead.phone.replace(/\s/g, '')}?text=${message}`, '_blank');
      
      toast.success('WhatsApp mesajı gönderildi');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;
    
    setActionLoading(true);
    try {
      const oldStatus = lead.status;
      await mockApi.updateLeadStatus(lead.id, newStatus);
      
      await mockApi.createLeadEvent({
        lead_id: lead.id,
        event_type: 'status_changed',
        actor_id: '1',
        metadata: { old_status: oldStatus, new_status: newStatus }
      });
      
      const leadData = await mockApi.getLeadById(lead.id);
      const eventsData = await mockApi.getLeadEventsByLeadId(lead.id);
      
      if (leadData) {
        setLead(leadData as Lead);
        setEvents(eventsData as LeadEvent[]);
      }
      
      toast.success('Durum güncellendi');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

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

  if (!lead) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-6">
      <Toaster position="top-center" />
      
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-6 sticky top-0 z-10 shadow-lg">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Geri</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">{lead.full_name}</h1>
            <p className="text-primary-100 text-sm">{lead.city}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
            {getStatusLabel(lead.status)}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCall}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            <Phone className="w-5 h-5" />
            Ara
          </button>
          <button
            onClick={handleWhatsApp}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Lead Bilgileri
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Telefon:</span>
              <span className="font-medium text-gray-900">{lead.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Şehir:</span>
              <span className="font-medium text-gray-900">{lead.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Form Zamanı:</span>
              <span className="font-medium text-gray-900">{formatDate(lead.form_time)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Atanma Zamanı:</span>
              <span className="font-medium text-gray-900">{lead.assigned_at ? formatDate(lead.assigned_at) : '-'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary-600" />
            Durum Güncelle
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {['new', 'contacted', 'converted', 'lost'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={actionLoading || lead.status === status}
                className={`py-3 rounded-xl font-semibold transition-all ${
                  lead.status === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" />
            Zaman Çizelgesi
          </h2>
          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Henüz bir aktivite yok</p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{getEventTypeLabel(event.event_type)}</p>
                    <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

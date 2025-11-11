'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { mockApi } from '@/lib/mock-data';
import { Lead, LeadEvent } from '@/types';
import { formatDate, getStatusColor, getStatusLabel, getEventTypeLabel } from '@/lib/utils';
import { ArrowLeft, Phone, MessageCircle, Clock, CheckCircle2, FileText, Bell, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [lead, setLead] = useState<Lead | null>(null);
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [showReminderModal, setShowReminderModal] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('hll_user_role');
    if (!role || role !== 'representative') {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const leadData = await mockApi.getLeadById(params.id as string);
        const eventsData = await mockApi.getLeadEventsByLeadId(params.id as string);
        
        if (leadData) {
          setLead(leadData as Lead);
          setEvents(eventsData as LeadEvent[]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router, params.id]);

  const handleCall = async () => {
    if (!lead) return;
    
    setActionLoading(true);
    try {
      // Simulate call action
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create event
      await mockApi.createLeadEvent({
        lead_id: lead.id,
        event_type: 'called',
        actor_id: '1',
        metadata: {},
      });
      
      // Open tel: link
      window.location.href = `tel:${lead.phone}`;
      
      toast.success('Arama başlatıldı!');
      
      // Reload events
      const eventsData = await mockApi.getLeadEventsByLeadId(lead.id);
      setEvents(eventsData as LeadEvent[]);
    } catch (error) {
      toast.error('Arama başlatılamadı');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!lead) return;
    
    setActionLoading(true);
    try {
      // Simulate WhatsApp action
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create event
      await mockApi.createLeadEvent({
        lead_id: lead.id,
        event_type: 'whatsapp',
        actor_id: '1',
        metadata: { message_sent: true },
      });
      
      // Open WhatsApp
      const message = encodeURIComponent(`Merhaba ${lead.full_name}, ben Ayşe Yılmaz 🌿 HommBitkisel ekibindenim, formunuzu aldım. Müsaitseniz hemen görüşebiliriz.`);
      window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
      
      toast.success('WhatsApp mesajı gönderildi!');
      
      // Reload events
      const eventsData = await mockApi.getLeadEventsByLeadId(lead.id);
      setEvents(eventsData as LeadEvent[]);
    } catch (error) {
      toast.error('WhatsApp mesajı gönderilemedi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;
    
    setActionLoading(true);
    try {
      // Simulate status update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const oldStatus = lead.status;
      
      // Update lead status
      await mockApi.updateLeadStatus(lead.id, newStatus);
      
      // Create event
      await mockApi.createLeadEvent({
        lead_id: lead.id,
        event_type: 'status_changed',
        actor_id: '1',
        metadata: { old_status: oldStatus, new_status: newStatus },
      });
      
      // Update local state
      setLead({ ...lead, status: newStatus as any });
      
      toast.success('Durum güncellendi!');
      
      // Reload events
      const eventsData = await mockApi.getLeadEventsByLeadId(lead.id);
      setEvents(eventsData as LeadEvent[]);
    } catch (error) {
      toast.error('Durum güncellenemedi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!lead || !note.trim()) return;
    
    setActionLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create note event
      await mockApi.createLeadEvent({
        lead_id: lead.id,
        event_type: 'status_changed',
        actor_id: '1',
        metadata: { note: note.trim(), type: 'note' },
      });
      
      toast.success('Not eklendi!');
      setNote('');
      setShowNoteModal(false);
      
      // Reload events
      const eventsData = await mockApi.getLeadEventsByLeadId(lead.id);
      setEvents(eventsData as LeadEvent[]);
    } catch (error) {
      toast.error('Not eklenemedi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetReminder = async () => {
    if (!lead || !reminderDate) return;
    
    setActionLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create reminder event
      await mockApi.createLeadEvent({
        lead_id: lead.id,
        event_type: 'status_changed',
        actor_id: '1',
        metadata: { reminder_date: reminderDate, type: 'reminder' },
      });
      
      toast.success('Hatırlatma ayarlandı!');
      setReminderDate('');
      setShowReminderModal(false);
      
      // Reload events
      const eventsData = await mockApi.getLeadEventsByLeadId(lead.id);
      setEvents(eventsData as LeadEvent[]);
    } catch (error) {
      toast.error('Hatırlatma ayarlanamadı');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Lead bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Geri
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {lead.full_name}
          </h1>
          <p className="text-sm text-gray-600 mt-1">{lead.city}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lead Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Lead Bilgileri
                  </h2>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    lead.status
                  )}`}
                >
                  {getStatusLabel(lead.status)}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Telefon</label>
                  <p className="text-lg font-medium text-gray-900">{lead.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Şehir</label>
                  <p className="text-lg font-medium text-gray-900">{lead.city}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Form Zamanı</label>
                  <p className="text-lg font-medium text-gray-900">
                    {formatDate(lead.form_time)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Atanma Zamanı</label>
                  <p className="text-lg font-medium text-gray-900">
                    {formatDate(lead.assigned_at)}
                  </p>
                </div>
                {lead.form_data && (
                  <>
                    <div>
                      <label className="text-sm text-gray-600">Kaynak</label>
                      <p className="text-lg font-medium text-gray-900">
                        {lead.form_data.source}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Kampanya</label>
                      <p className="text-lg font-medium text-gray-900">
                        {lead.form_data.campaign}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Event Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Geçmiş
              </h2>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Henüz bir işlem yapılmadı</p>
                ) : (
                  events.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.event_type === 'created' ? 'bg-blue-100' :
                          event.event_type === 'assigned' ? 'bg-purple-100' :
                          event.event_type === 'called' ? 'bg-green-100' :
                          event.event_type === 'whatsapp' ? 'bg-green-100' :
                          'bg-yellow-100'
                        }`}>
                          {event.event_type === 'called' ? (
                            <Phone className="w-5 h-5 text-green-600" />
                          ) : event.event_type === 'whatsapp' ? (
                            <MessageCircle className="w-5 h-5 text-green-600" />
                          ) : event.event_type === 'status_changed' ? (
                            <CheckCircle2 className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        {index < events.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900">
                          {event.metadata?.type === 'note' ? '📝 Görüşme Notu' :
                           event.metadata?.type === 'reminder' ? '🔔 Hatırlatma' :
                           getEventTypeLabel(event.event_type)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(event.timestamp)}
                        </p>
                        {event.metadata?.note && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">{event.metadata.note}</p>
                          </div>
                        )}
                        {event.metadata?.reminder_date && (
                          <div className="mt-2 p-3 bg-orange-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              Hatırlatma: {formatDate(event.metadata.reminder_date)}
                            </p>
                          </div>
                        )}
                        {event.metadata?.old_status && event.metadata?.new_status && (
                          <p className="text-xs text-gray-500 mt-1">
                            {getStatusLabel(event.metadata.old_status)} → {getStatusLabel(event.metadata.new_status)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">İşlemler</h3>
              <div className="space-y-3">
                <button
                  onClick={handleCall}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  <Phone className="w-5 h-5" />
                  Ara
                </button>
                <button
                  onClick={handleWhatsApp}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Gönder
                </button>
                <button
                  onClick={() => setShowNoteModal(true)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <FileText className="w-5 h-5" />
                  Not Ekle
                </button>
                <button
                  onClick={() => setShowReminderModal(true)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  <Bell className="w-5 h-5" />
                  Hatırlatma Ayarla
                </button>
              </div>
            </div>

            {/* Status Update */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Durum Güncelle</h3>
              <div className="space-y-2">
                {['new', 'contacted', 'converted', 'lost'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={actionLoading || lead.status === status}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Görüşme Notu Ekle</h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Görüşme notlarınızı buraya yazın..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleAddNote}
                disabled={!note.trim() || actionLoading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Hatırlatma Ayarla</h3>
              <button
                onClick={() => setShowReminderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hatırlatma Tarihi ve Saati
                </label>
                <input
                  type="datetime-local"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 Belirlediğiniz tarih ve saatte size bildirim gönderilecektir.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReminderModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleSetReminder}
                disabled={!reminderDate || actionLoading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                Ayarla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

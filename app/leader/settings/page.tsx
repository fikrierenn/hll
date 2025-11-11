'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockApi } from '@/lib/mock-data';
import { User } from '@/types';
import { Settings, Users, UserPlus, ToggleLeft, ToggleRight, X, Bell, Shield, HelpCircle } from 'lucide-react';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';

export default function LeaderSettingsPage() {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditAdCreditsModal, setShowEditAdCreditsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [newAdCredits, setNewAdCredits] = useState(0);
  const [newRep, setNewRep] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    ad_credits: 10
  });

  useEffect(() => {
    const role = localStorage.getItem('hll_user_role');
    if (!role || role !== 'leader') {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const members = await mockApi.getUsersByLeaderId('4');
        setTeamMembers(members as User[]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleAddRepresentative = async () => {
    if (!newRep.name || !newRep.email || !newRep.phone) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    const newUser: User = {
      id: `rep-${Date.now()}`,
      name: newRep.name,
      email: newRep.email,
      phone: newRep.phone,
      role: 'representative',
      leader_id: '4',
      region: newRep.region || 'İstanbul',
      is_active: true,
      fcm_token: '',
      ad_credits: newRep.ad_credits
    };

    setTeamMembers([...teamMembers, newUser]);
    setShowAddModal(false);
    setNewRep({ name: '', email: '', phone: '', region: '', ad_credits: 10 });
    
    alert(`✅ ${newRep.name} başarıyla eklendi!`);
  };

  const toggleRepresentativeStatus = (repId: string) => {
    const updatedMembers = teamMembers.map(member => 
      member.id === repId 
        ? { ...member, is_active: !member.is_active }
        : member
    );
    setTeamMembers(updatedMembers);
    
    const member = updatedMembers.find(m => m.id === repId);
    alert(`${member?.name} ${member?.is_active ? 'aktif' : 'pasif'} edildi`);
  };

  const openEditAdCredits = (member: User) => {
    setSelectedMember(member);
    setNewAdCredits(member.ad_credits || 0);
    setShowEditAdCreditsModal(true);
  };

  const handleUpdateAdCredits = () => {
    if (!selectedMember) return;

    const updatedMembers = teamMembers.map(member =>
      member.id === selectedMember.id
        ? { ...member, ad_credits: newAdCredits }
        : member
    );
    setTeamMembers(updatedMembers);
    setShowEditAdCreditsModal(false);
    setSelectedMember(null);
    
    alert(`✅ ${selectedMember.name} için reklam hakkı ${newAdCredits} olarak güncellendi!`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <MobileHeader
        title="Ayarlar"
        subtitle="Ekip ve Uygulama Yönetimi"
      />

      <div className="px-4 py-6 space-y-6">
        {/* Team Management Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Ekip Yönetimi ({teamMembers.length})
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 active:scale-95 transition-all shadow-sm"
            >
              <UserPlus className="w-5 h-5" />
              Ekle
            </button>
          </div>

          {/* Team Members List */}
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                    <p className="text-sm text-gray-500">{member.phone} • {member.region}</p>
                  </div>
                  <button
                    onClick={() => toggleRepresentativeStatus(member.id)}
                    className="flex items-center gap-2"
                  >
                    {member.is_active ? (
                      <ToggleRight className="w-10 h-10 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      member.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {member.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                      🎯 {member.ad_credits || 0} Reklam Hakkı
                    </span>
                  </div>
                  <button
                    onClick={() => openEditAdCredits(member)}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200 active:scale-95 transition-all"
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* App Settings */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Uygulama Ayarları
          </h2>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-900">Bildirimler</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-t">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-900">Gizlilik</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-t">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-900">Yardım & Destek</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <Footer />
      <BottomNav role="leader" />

      {/* Edit Ad Credits Modal */}
      {showEditAdCreditsModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Reklam Hakkı Düzenle</h3>
              <button
                onClick={() => setShowEditAdCreditsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-purple-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Temsilci</p>
                <p className="text-lg font-bold text-gray-900">{selectedMember.name}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Haftalık Reklam Hakkı
                </label>
                <input
                  type="number"
                  min="0"
                  value={newAdCredits}
                  onChange={(e) => setNewAdCredits(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-lg font-semibold text-center"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Bu temsilciye haftalık kaç reklam atanacağını belirler
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={() => setShowEditAdCreditsModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 active:scale-95 transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleUpdateAdCredits}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 active:scale-95 transition-all shadow-sm"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Representative Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Yeni Temsilci Ekle</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  value={newRep.name}
                  onChange={(e) => setNewRep({ ...newRep, name: e.target.value })}
                  placeholder="Örn: Mehmet Yılmaz"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newRep.email}
                  onChange={(e) => setNewRep({ ...newRep, email: e.target.value })}
                  placeholder="ornek@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={newRep.phone}
                  onChange={(e) => setNewRep({ ...newRep, phone: e.target.value })}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bölge
                </label>
                <input
                  type="text"
                  value={newRep.region}
                  onChange={(e) => setNewRep({ ...newRep, region: e.target.value })}
                  placeholder="Örn: İstanbul"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Haftalık Reklam Hakkı
                </label>
                <input
                  type="number"
                  min="0"
                  value={newRep.ad_credits}
                  onChange={(e) => setNewRep({ ...newRep, ad_credits: parseInt(e.target.value) || 0 })}
                  placeholder="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bu temsilciye haftalık kaç reklam atanacağını belirler
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 active:scale-95 transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleAddRepresentative}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 active:scale-95 transition-all shadow-sm"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

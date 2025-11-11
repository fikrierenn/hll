'use client';

import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, LogOut, Settings, Bell, HelpCircle, Shield, Users } from 'lucide-react';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';

export default function LeaderProfile() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('hll_user_role');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <MobileHeader
        title="Profil"
        subtitle="Hesap Ayarları"
        color="purple"
      />

      <div className="px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <span className="text-3xl font-bold">AÖ</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Ali Öztürk</h2>
              <p className="text-sm text-gray-500">Lider - Marmara Bölgesi</p>
            </div>
          </div>

          {/* Info List */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">ali.ozturk@hll.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Telefon</p>
                <p className="font-medium">0555 111 2233</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Bölge</p>
                <p className="font-medium">Marmara</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Ekip Üyesi</p>
                <p className="font-medium">3 Temsilci</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl font-semibold hover:bg-red-100 active:scale-98 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Çıkış Yap
        </button>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>HLL - HommLink Lead</p>
          <p className="text-xs mt-1">Versiyon 1.0.0</p>
        </div>
      </div>

      <BottomNav role="leader" />
    </div>
  );
}

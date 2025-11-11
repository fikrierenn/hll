'use client';

import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, LogOut, Settings, Bell, HelpCircle, Shield } from 'lucide-react';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';

export default function RepresentativeProfile() {
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
      />

      <div className="px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <span className="text-3xl font-bold">AY</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Ayşe Yılmaz</h2>
              <p className="text-sm text-gray-500">Temsilci</p>
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
                <p className="font-medium">ayse.yilmaz@hll.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Telefon</p>
                <p className="font-medium">0532 123 4567</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Bölge</p>
                <p className="font-medium">İstanbul</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">Ayarlar</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-t">
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

      <BottomNav role="representative" />
    </div>
  );
}

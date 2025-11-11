'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { Users, UserCog } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = [
    {
      value: 'representative' as UserRole,
      label: 'Temsilci',
      description: 'Lead yönetimi ve müşteri takibi',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      value: 'leader' as UserRole,
      label: 'Lider',
      description: 'Ekip yönetimi ve performans takibi',
      icon: UserCog,
      color: 'bg-purple-500',
    },
  ];

  const handleLogin = () => {
    if (!selectedRole) return;
    
    // Store role in localStorage for demo
    localStorage.setItem('hll_user_role', selectedRole);
    
    // Redirect based on role
    if (selectedRole === 'representative') {
      router.push('/representative');
    } else if (selectedRole === 'leader') {
      router.push('/leader');
    } else {
      router.push('/super-leader');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold text-primary-600">H</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            HommLink Lead
          </h1>
          <p className="text-primary-100">
            Lead Yönetim Sistemi
          </p>
        </div>

        {/* Role Selection */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Rolünüzü Seçin
          </h2>
          
          <div className="space-y-3 mb-6">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.value;
              
              return (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-md active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${role.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-1">
                        {role.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {role.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleLogin}
            disabled={!selectedRole}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
              selectedRole
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:shadow-xl active:scale-[0.98] shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedRole ? 'Giriş Yap →' : 'Rol Seçin'}
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            Demo modunda çalışıyorsunuz
          </p>

          <div className="text-center text-xs text-gray-400 mt-6">
            <p>Powered by <span className="font-semibold text-gray-500">PivotEra</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

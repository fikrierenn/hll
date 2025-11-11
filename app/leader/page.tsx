'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockApi } from '@/lib/mock-data';
import { TeamPerformance } from '@/types';
import { Users, Award } from 'lucide-react';
import { formatPercentage, formatMinutes } from '@/lib/utils';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';

export default function LeaderPage() {
  const router = useRouter();
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('hll_user_role');
    if (!role || role !== 'leader') {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const performance = await mockApi.getTeamPerformance('4');
        setTeamPerformance(performance);
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const totalLeads = teamPerformance.reduce((sum, p) => sum + p.total_leads, 0);
  const totalConverted = teamPerformance.reduce((sum, p) => sum + p.converted_leads, 0);
  const avgSalesRatio = teamPerformance.length > 0
    ? teamPerformance.reduce((sum, p) => sum + p.sales_ratio, 0) / teamPerformance.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <MobileHeader
        title="Ali Öztürk"
        subtitle="Lider Paneli"
        color="purple"
        stats={[
          { label: 'Ekip', value: teamPerformance.length },
          { label: 'Aktif', value: teamPerformance.filter(p => p.total_leads > 0).length },
          { label: 'Bugün', value: totalLeads },
        ]}
      />

      <div className="px-4 py-6 space-y-6">
        {/* Team Performance */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Ekip Performansı
          </h2>
          
          <div className="space-y-3">
            {teamPerformance.map((perf) => (
              <div
                key={perf.representative_id}
                className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {perf.representative_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {perf.total_leads} lead • {perf.contacted_leads} görüşüldü
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      perf.sales_ratio >= 40 ? 'text-green-600' :
                      perf.sales_ratio >= 20 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {formatPercentage(perf.sales_ratio)}
                    </div>
                    <p className="text-xs text-gray-500">satış oranı</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {perf.converted_leads}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Satış</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {formatMinutes(perf.avg_response_minutes)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Ort. Yanıt</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {perf.contacted_leads}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Görüşülen</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performer */}
        {teamPerformance.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">En İyi Performans</p>
                <h3 className="text-xl font-bold">
                  {teamPerformance.sort((a, b) => b.sales_ratio - a.sales_ratio)[0].representative_name}
                </h3>
              </div>
            </div>
            <p className="text-white/90">
              {formatPercentage(teamPerformance[0].sales_ratio)} satış oranı ile lider
            </p>
          </div>
        )}
      </div>

      <Footer />
      <BottomNav role="leader" />
    </div>
  );
}

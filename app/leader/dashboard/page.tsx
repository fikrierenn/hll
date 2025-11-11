'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockApi } from '@/lib/mock-data';
import { TeamPerformance } from '@/types';
import { TrendingUp, Users, Target, Award, Clock, Calendar } from 'lucide-react';
import { formatPercentage, formatMinutes } from '@/lib/utils';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';

export default function LeaderDashboard() {
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

  const avgSalesRatio = teamPerformance.length > 0
    ? teamPerformance.reduce((sum, p) => sum + p.sales_ratio, 0) / teamPerformance.length
    : 0;
  const avgResponseTime = teamPerformance.length > 0
    ? teamPerformance.reduce((sum, p) => sum + p.avg_response_minutes, 0) / teamPerformance.length
    : 0;
  const bestPerformer = teamPerformance.sort((a, b) => b.sales_ratio - a.sales_ratio)[0];
  const fastestResponder = teamPerformance.sort((a, b) => a.avg_response_minutes - b.avg_response_minutes)[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <MobileHeader
        title="Performans Analizi"
        subtitle="Haftalık Rapor"
        color="purple"
        stats={[
          { label: 'Ekip', value: teamPerformance.length },
          { label: 'Başarı', value: formatPercentage(avgSalesRatio) },
          { label: 'Yanıt', value: formatMinutes(avgResponseTime) },
        ]}
      />

      <div className="px-4 py-6 space-y-6">
        {/* Weekly Trend */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-purple-100 text-sm font-medium">Bu Hafta</p>
              <p className="text-2xl font-bold">Ekip Performansı</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-3xl font-bold">+12%</p>
              <p className="text-purple-100 text-xs mt-1">Satış Artışı</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-3xl font-bold">-8%</p>
              <p className="text-purple-100 text-xs mt-1">Yanıt Süresi</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-3xl font-bold">+5</p>
              <p className="text-purple-100 text-xs mt-1">Yeni Satış</p>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Öne Çıkanlar
          </h3>
          <div className="space-y-3">
            {/* Best Sales */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">🏆 En Yüksek Satış</p>
                  <p className="font-bold text-gray-900">{bestPerformer?.representative_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercentage(bestPerformer?.sales_ratio || 0)}
                  </p>
                  <p className="text-xs text-gray-600">{bestPerformer?.converted_leads} satış</p>
                </div>
              </div>
            </div>

            {/* Fastest Response */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">⚡ En Hızlı Yanıt</p>
                  <p className="font-bold text-gray-900">{fastestResponder?.representative_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatMinutes(fastestResponder?.avg_response_minutes || 0)}
                  </p>
                  <p className="text-xs text-gray-600">ortalama</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Ranking */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-4">Sıralama</h3>
          <div className="space-y-3">
            {teamPerformance
              .sort((a, b) => b.sales_ratio - a.sales_ratio)
              .map((perf, index) => (
              <div key={perf.representative_id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{perf.representative_name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{perf.converted_leads} satış</span>
                    <span>•</span>
                    <span>{formatMinutes(perf.avg_response_minutes)} yanıt</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{formatPercentage(perf.sales_ratio)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-4">Aktivite Özeti</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Toplam Görüşme</span>
              <span className="font-bold text-gray-900">
                {teamPerformance.reduce((sum, p) => sum + p.contacted_leads, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Başarılı Kapanış</span>
              <span className="font-bold text-green-600">
                {teamPerformance.reduce((sum, p) => sum + p.converted_leads, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ortalama Başarı</span>
              <span className="font-bold text-purple-600">{formatPercentage(avgSalesRatio)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-900 font-semibold">Ekip Performansı</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                avgSalesRatio >= 40 ? 'bg-green-100 text-green-600' :
                avgSalesRatio >= 20 ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {avgSalesRatio >= 40 ? 'Mükemmel' :
                 avgSalesRatio >= 20 ? 'İyi' : 'Gelişmeli'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav role="leader" />
    </div>
  );
}

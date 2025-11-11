'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockApi } from '@/lib/mock-data';
import { DashboardKPIs, Lead } from '@/types';
import { formatMinutes, formatPercentage, getStatusLabel } from '@/lib/utils';
import { TrendingUp, Clock, Target, CheckCircle, Award, Zap } from 'lucide-react';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { StatCard } from '@/components/ui/StatCard';

export default function RepresentativeDashboard() {
  const router = useRouter();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('hll_user_role');
    if (!role || role !== 'representative') {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const [kpisData, leadsData] = await Promise.all([
          mockApi.getDashboardKPIs('1', 'representative', '2025-11-10'),
          mockApi.getLeadsByAssignedTo('1'),
        ]);
        setKpis(kpisData);
        setAllLeads(leadsData as Lead[]);
        setRecentLeads((leadsData as Lead[]).slice(0, 5));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Lead durumlarına göre sayılar
  const newLeadsCount = allLeads.filter(l => l.status === 'new').length;
  const contactedLeadsCount = allLeads.filter(l => l.status === 'contacted').length;
  const convertedLeadsCount = allLeads.filter(l => l.status === 'converted').length;
  const lostLeadsCount = allLeads.filter(l => l.status === 'lost').length;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <MobileHeader
        title="Performans"
        subtitle="Bugünün Özeti"
        stats={[
          { label: 'Görüşme', value: kpis?.contacted_leads || 0 },
          { label: 'Başarı', value: formatPercentage(kpis?.sales_ratio || 0) },
          { label: 'Yanıt', value: formatMinutes(kpis?.avg_response_minutes || 0) },
        ]}
      />

      <div className="px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Target}
            label="Toplam Lead"
            value={kpis?.total_leads || 0}
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            label="Görüşülen"
            value={kpis?.contacted_leads || 0}
            color="yellow"
          />
          <StatCard
            icon={TrendingUp}
            label="Satış"
            value={kpis?.converted_leads || 0}
            subtitle={formatPercentage(kpis?.sales_ratio || 0)}
            color="green"
          />
          <StatCard
            icon={Clock}
            label="Ort. Yanıt"
            value={formatMinutes(kpis?.avg_response_minutes || 0)}
            color="purple"
          />
        </div>

        {/* Performance Ring */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-100 text-sm font-medium mb-1">Satış Başarısı</p>
              <p className="text-4xl font-bold">{formatPercentage(kpis?.sales_ratio || 0)}</p>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Award className="w-10 h-10" />
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all"
              style={{ width: `${kpis?.sales_ratio || 0}%` }}
            ></div>
          </div>
          <p className="text-primary-100 text-sm mt-3">
            {kpis?.converted_leads || 0} satış / {kpis?.total_leads || 0} lead
          </p>
        </div>

        {/* Lead Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-4">Lead Durumları</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold text-white">{newLeadsCount}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">Yeni</p>
              <p className="text-xs text-gray-500 mt-1">
                {allLeads.length > 0 ? formatPercentage((newLeadsCount / allLeads.length) * 100) : '%0'}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold text-white">{contactedLeadsCount}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">Görüşüldü</p>
              <p className="text-xs text-gray-500 mt-1">
                {allLeads.length > 0 ? formatPercentage((contactedLeadsCount / allLeads.length) * 100) : '%0'}
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold text-white">{convertedLeadsCount}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">Satış</p>
              <p className="text-xs text-gray-500 mt-1">
                {allLeads.length > 0 ? formatPercentage((convertedLeadsCount / allLeads.length) * 100) : '%0'}
              </p>
            </div>

            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold text-white">{lostLeadsCount}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">Kayıp</p>
              <p className="text-xs text-gray-500 mt-1">
                {allLeads.length > 0 ? formatPercentage((lostLeadsCount / allLeads.length) * 100) : '%0'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-bold text-gray-900">Son Lead'ler</h3>
          </div>
          <div className="divide-y">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="p-4 active:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{lead.full_name}</h4>
                    <p className="text-sm text-gray-500">{lead.city}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      lead.status === 'new'
                        ? 'bg-blue-100 text-blue-800'
                        : lead.status === 'contacted'
                        ? 'bg-yellow-100 text-yellow-800'
                        : lead.status === 'converted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <BottomNav role="representative" />
    </div>
  );
}

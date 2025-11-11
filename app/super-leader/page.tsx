'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockApi } from '@/lib/mock-data';
import { Lead } from '@/types';
import { Target, TrendingUp, Users, Clock, MapPin } from 'lucide-react';
import { formatPercentage } from '@/lib/utils';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { StatCard } from '@/components/ui/StatCard';

export default function SuperLeaderPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('hll_user_role');
    if (!role || role !== 'super_leader') {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const leadsData = await mockApi.getLeads();
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const contactedLeads = leads.filter(l => ['contacted', 'converted'].includes(l.status)).length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const lostLeads = leads.filter(l => l.status === 'lost').length;
  const salesRatio = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  // City performance
  const cityStats = leads.reduce((acc, lead) => {
    if (!acc[lead.city]) {
      acc[lead.city] = { total: 0, converted: 0 };
    }
    acc[lead.city].total++;
    if (lead.status === 'converted') {
      acc[lead.city].converted++;
    }
    return acc;
  }, {} as Record<string, { total: number; converted: number }>);

  const cityPerformance = Object.entries(cityStats)
    .map(([city, stats]) => ({
      city,
      total: stats.total,
      converted: stats.converted,
      ratio: (stats.converted / stats.total) * 100,
    }))
    .sort((a, b) => b.ratio - a.ratio);

  // Status distribution
  const statusData = [
    { status: 'new', label: 'Yeni', color: 'bg-blue-500', count: leads.filter(l => l.status === 'new').length },
    { status: 'contacted', label: 'Görüşüldü', color: 'bg-yellow-500', count: leads.filter(l => l.status === 'contacted').length },
    { status: 'converted', label: 'Satış', color: 'bg-green-500', count: leads.filter(l => l.status === 'converted').length },
    { status: 'lost', label: 'Kayıp', color: 'bg-red-500', count: leads.filter(l => l.status === 'lost').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <MobileHeader
        title="Ahmet Yıldırım"
        subtitle="Üst Lider Paneli"
        color="orange"
        stats={[
          { label: 'Yeni', value: newLeads },
          { label: 'Görüşülen', value: contactedLeads },
          { label: 'Kayıp', value: lostLeads },
        ]}
      />

      <div className="px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Target}
            label="Toplam Lead"
            value={totalLeads}
            color="blue"
          />
          <StatCard
            icon={Clock}
            label="Görüşülen"
            value={contactedLeads}
            color="yellow"
          />
          <StatCard
            icon={TrendingUp}
            label="Satış"
            value={convertedLeads}
            subtitle={formatPercentage(salesRatio)}
            color="green"
          />
          <StatCard
            icon={Users}
            label="Aktif Temsilci"
            value={5}
            color="purple"
          />
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Lead Durumu</h2>
          <div className="grid grid-cols-2 gap-4">
            {statusData.map((item) => {
              const percentage = totalLeads > 0 ? (item.count / totalLeads) * 100 : 0;
              return (
                <div key={item.status} className="text-center">
                  <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md`}>
                    <span className="text-2xl font-bold text-white">{item.count}</span>
                  </div>
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{formatPercentage(percentage)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* City Performance */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            Bölgesel Performans
          </h2>
          <div className="space-y-4">
            {cityPerformance.map((city, index) => (
              <div key={city.city}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-gray-900">{city.city}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-orange-600 text-lg">
                      {formatPercentage(city.ratio)}
                    </span>
                    <p className="text-xs text-gray-500">
                      {city.converted}/{city.total}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                    style={{ width: `${city.ratio}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <BottomNav role="super_leader" />
    </div>
  );
}

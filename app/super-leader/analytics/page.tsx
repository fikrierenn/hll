'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Award, MapPin, Calendar } from 'lucide-react';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { performanceData, usersData, leadsData } from '@/lib/mock-data';
import type { PerformanceSummary, User, Lead } from '@/types';

export default function SuperLeaderAnalyticsPage() {
  const [performance, setPerformance] = useState<PerformanceSummary[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('weekly');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setPerformance(performanceData as PerformanceSummary[]);
      setUsers(usersData as User[]);
      setLeads(leadsData as Lead[]);
      setLoading(false);
    };
    loadData();
  }, [dateRange]);

  // Team comparison data
  const teamComparison = users
    .filter(u => u.role === 'leader')
    .map(leader => {
      const teamMembers = users.filter(u => u.leader_id === leader.id);
      const teamPerf = performance.filter(p => 
        teamMembers.some(m => m.id === p.user_id)
      );
      
      const totalLeads = teamPerf.reduce((sum, p) => sum + p.total_leads, 0);
      const totalConverted = teamPerf.reduce((sum, p) => sum + p.converted_leads, 0);
      const salesRatio = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;
      
      return {
        teamName: leader.name,
        members: teamMembers.length,
        totalLeads,
        converted: totalConverted,
        salesRatio: salesRatio.toFixed(1)
      };
    })
    .sort((a, b) => parseFloat(b.salesRatio) - parseFloat(a.salesRatio));

  // Regional performance
  const regionalPerf = leads.reduce((acc, lead) => {
    const city = lead.city || 'Diğer';
    if (!acc[city]) {
      acc[city] = { total: 0, converted: 0 };
    }
    acc[city].total++;
    if (lead.status === 'converted') acc[city].converted++;
    return acc;
  }, {} as Record<string, { total: number; converted: number }>);

  const topRegions = Object.entries(regionalPerf)
    .map(([city, data]) => ({
      city,
      total: data.total,
      converted: data.converted,
      ratio: data.total > 0 ? ((data.converted / data.total) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio))
    .slice(0, 5);

  // Top performers
  const topReps = performance
    .filter(p => {
      const user = users.find(u => u.id === p.user_id);
      return user?.role === 'representative';
    })
    .map(p => {
      const user = users.find(u => u.id === p.user_id);
      return {
        name: user?.name || 'Unknown',
        totalLeads: p.total_leads,
        converted: p.converted_leads,
        salesRatio: p.sales_ratio,
        avgResponse: p.avg_response_minutes
      };
    })
    .sort((a, b) => b.salesRatio - a.salesRatio)
    .slice(0, 5);

  const fastestReps = [...performance]
    .filter(p => {
      const user = users.find(u => u.id === p.user_id);
      return user?.role === 'representative' && p.avg_response_minutes > 0;
    })
    .map(p => {
      const user = users.find(u => u.id === p.user_id);
      return {
        name: user?.name || 'Unknown',
        avgResponse: p.avg_response_minutes
      };
    })
    .sort((a, b) => a.avgResponse - b.avgResponse)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <MobileHeader title="Karşılaştırmalı Analiz" subtitle="Yükleniyor..." />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader 
        title="Karşılaştırmalı Analiz" 
        subtitle="Organizasyon Geneli"
        stats={[
          { label: 'Ekip', value: teamComparison.length.toString() },
          { label: 'Temsilci', value: users.filter(u => u.role === 'representative').length.toString() },
          { label: 'Bölge', value: Object.keys(regionalPerf).length.toString() }
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Date Range Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Zaman Aralığı</span>
          </div>
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                  dateRange === range
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range === 'daily' ? 'Günlük' : range === 'weekly' ? 'Haftalık' : 'Aylık'}
              </button>
            ))}
          </div>
        </div>

        {/* Team Comparison */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-lg text-gray-900">Ekip Karşılaştırması</h2>
          </div>
          <div className="space-y-3">
            {teamComparison.map((team, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{team.teamName}</p>
                      <p className="text-xs text-gray-500">{team.members} temsilci</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">%{team.salesRatio}</p>
                    <p className="text-xs text-gray-500">{team.converted}/{team.totalLeads}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${team.salesRatio}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-600" />
            <h2 className="font-bold text-lg text-gray-900">En İyi Performans</h2>
          </div>
          <div className="space-y-3">
            {topReps.map((rep, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{rep.name}</p>
                    <p className="text-xs text-gray-500">{rep.converted}/{rep.totalLeads} satış</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">%{rep.salesRatio.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">{rep.avgResponse}dk yanıt</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fastest Response */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-lg text-gray-900">En Hızlı Yanıt</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {fastestReps.map((rep, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold mb-2 ${
                  index === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                  'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <p className="font-semibold text-sm text-gray-900 mb-1">{rep.name}</p>
                <p className="text-lg font-bold text-blue-600">{rep.avgResponse}dk</p>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Performance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-lg text-gray-900">Bölgesel Performans</h2>
          </div>
          <div className="space-y-3">
            {topRegions.map((region, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <p className="font-semibold text-gray-900">{region.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">%{region.ratio}</p>
                    <p className="text-xs text-gray-500">{region.converted}/{region.total}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${region.ratio}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Organization Stats */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" />
            <h2 className="font-bold text-lg">Organizasyon Özeti</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">Toplam Ekip</p>
              <p className="text-3xl font-bold">{teamComparison.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">Toplam Temsilci</p>
              <p className="text-3xl font-bold">{users.filter(u => u.role === 'representative').length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">Aktif Bölge</p>
              <p className="text-3xl font-bold">{Object.keys(regionalPerf).length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">Toplam Lead</p>
              <p className="text-3xl font-bold">{leads.length}</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav role="super_leader" />
    </div>
  );
}

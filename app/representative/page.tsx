'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockApi } from '@/lib/mock-data';
import { Lead } from '@/types';
import { Phone, Filter, Search } from 'lucide-react';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { LeadCard } from '@/components/ui/LeadCard';

export default function RepresentativePage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const role = localStorage.getItem('hll_user_role');
    if (!role || role !== 'representative') {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const leadsData = await mockApi.getLeadsByAssignedTo('1');
        setLeads(leadsData as Lead[]);
        setFilteredLeads(leadsData as Lead[]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Filter and search
  useEffect(() => {
    let filtered = leads;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(lead =>
        lead.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLeads(filtered);
  }, [leads, statusFilter, searchQuery]);

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

  const newLeads = leads.filter(l => l.status === 'new').length;
  const contactedLeads = leads.filter(l => l.status === 'contacted').length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <MobileHeader
        title="Ayşe Yılmaz"
        subtitle="Temsilci Paneli"
        stats={[
          { label: 'Yeni', value: newLeads },
          { label: 'Görüşülen', value: contactedLeads },
          { label: 'Satış', value: convertedLeads },
        ]}
      />

      {/* Search and Filter */}
      <div className="px-4 pt-6 pb-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="İsim, telefon veya şehir ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { value: 'all', label: 'Tümü', count: leads.length },
            { value: 'new', label: 'Yeni', count: newLeads },
            { value: 'contacted', label: 'Görüşülen', count: contactedLeads },
            { value: 'converted', label: 'Satış', count: convertedLeads },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                statusFilter === filter.value
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{filter.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                statusFilter === filter.value
                  ? 'bg-white/20'
                  : 'bg-gray-100'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lead List */}
      <div className="px-4 pb-6 space-y-4">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              {searchQuery || statusFilter !== 'all' 
                ? 'Sonuç bulunamadı' 
                : 'Henüz lead bulunmuyor'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery || statusFilter !== 'all'
                ? 'Farklı filtreler deneyin'
                : 'Yeni lead\'ler burada görünecek'}
            </p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              href={`/representative/leads/${lead.id}`}
            />
          ))
        )}
      </div>

      <Footer />
      <BottomNav role="representative" />
    </div>
  );
}

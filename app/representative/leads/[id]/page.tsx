import { leadsData } from '@/lib/mock-data';
import LeadDetailClient from './LeadDetailClient';

export function generateStaticParams() {
  // Tüm lead'leri static generate et
  return leadsData.map((lead) => ({
    id: lead.id,
  }));
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LeadDetailClient leadId={id} />;
}

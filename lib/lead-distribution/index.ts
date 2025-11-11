/**
 * Akıllı Lead Dağıtım Sistemi
 * Hibrit Yaklaşım: Gerçek Zamanlı Round-Robin + Günlük Deficit Telafisi
 */

export interface WeeklyParticipation {
  id: string;
  user_id: string;
  user_name: string;
  week_start: string;
  week_end: string;
  credits: number;
  total_credits: number;
  target_share: number;
}

export interface DailyQueueItem {
  id: string;
  date: string;
  user_id: string;
  user_name: string;
  position: number;
  credits: number;
  slots_in_queue: number;
}

export interface DailyDeficit {
  user_id: string;
  user_name: string;
  date: string;
  target_leads: number;
  actual_leads: number;
  deficit: number;
  cumulative_deficit: number;
}

export interface LeadAssignment {
  lead_id: string;
  user_id: string;
  assigned_at: string;
  week_start: string;
  date: string;
}

/**
 * Hafta başlangıç tarihini hesapla (Pazartesi)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Hafta bitiş tarihini hesapla (Pazar)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Tarih formatla (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Sırayı kredi gruplarına göre karıştır
 * Aynı krediye sahip olanlar kendi aralarında rastgele sıralanır
 */
export function shuffleQueueByCredits(queue: Array<{ user_id: string; credits: number }>): Array<{ user_id: string; credits: number; position: number }> {
  // Krediye göre grupla
  const groups: { [key: number]: Array<{ user_id: string; credits: number }> } = {};
  
  queue.forEach(item => {
    if (!groups[item.credits]) {
      groups[item.credits] = [];
    }
    groups[item.credits].push(item);
  });
  
  // Her grubu kendi içinde karıştır
  Object.keys(groups).forEach(credit => {
    groups[parseInt(credit)] = groups[parseInt(credit)].sort(() => Math.random() - 0.5);
  });
  
  // Grupları birleştir ve pozisyon ekle
  const shuffled: Array<{ user_id: string; credits: number; position: number }> = [];
  const creditKeys = Object.keys(groups).map(k => parseInt(k)).sort((a, b) => b - a);
  
  let maxLength = Math.max(...Object.values(groups).map(g => g.length));
  
  for (let i = 0; i < maxLength; i++) {
    creditKeys.forEach(credit => {
      if (groups[credit][i]) {
        shuffled.push({
          ...groups[credit][i],
          position: shuffled.length
        });
      }
    });
  }
  
  return shuffled;
}

/**
 * Kullanıcı için slot sayısını hesapla (deficit telafisi ile)
 */
export function calculateSlots(credits: number, deficit: number): number {
  let slots = credits;
  
  // Deficit telafisi
  if (deficit > 0) {
    // Eksik almışsa: Her 1 eksik için +1 slot
    slots += Math.floor(deficit);
  } else if (deficit < 0) {
    // Fazla almışsa: Her 1 fazla için -1 slot (minimum 1)
    slots = Math.max(1, slots + Math.ceil(deficit));
  }
  
  return slots;
}

/**
 * Günlük sıra oluştur
 */
export function createDailyQueueFromParticipations(
  participations: WeeklyParticipation[],
  deficits: { [userId: string]: number } = {}
): DailyQueueItem[] {
  const queue: Array<{ user_id: string; user_name: string; credits: number }> = [];
  
  // Her katılımcı için slot sayısını hesapla ve sıraya ekle
  participations.forEach(p => {
    const deficit = deficits[p.user_id] || 0;
    const slots = calculateSlots(p.credits, deficit);
    
    for (let i = 0; i < slots; i++) {
      queue.push({
        user_id: p.user_id,
        user_name: p.user_name,
        credits: p.credits
      });
    }
  });
  
  // Sırayı karıştır
  const shuffled = shuffleQueueByCredits(queue);
  
  // DailyQueueItem formatına çevir
  const today = formatDate(new Date());
  return shuffled.map((item, index) => ({
    id: `queue-${item.user_id}-${index}`,
    date: today,
    user_id: item.user_id,
    user_name: (queue.find(q => q.user_id === item.user_id) as any).user_name,
    position: index,
    credits: item.credits,
    slots_in_queue: queue.filter(q => q.user_id === item.user_id).length
  }));
}

/**
 * Deficit hesapla
 */
export function calculateDeficit(
  targetShare: number,
  totalLeads: number,
  actualLeads: number
): number {
  const targetLeads = targetShare * totalLeads;
  return targetLeads - actualLeads;
}

/**
 * Haftalık özet rapor oluştur
 */
export function generateWeeklyReport(
  participations: WeeklyParticipation[],
  assignments: { [userId: string]: number }
): string {
  let report = '📊 Haftalık Lead Dağıtım Raporu\n\n';
  
  const totalLeads = Object.values(assignments).reduce((sum, count) => sum + count, 0);
  
  participations.forEach(p => {
    const actualLeads = assignments[p.user_id] || 0;
    const targetLeads = p.target_share * totalLeads;
    const deficit = targetLeads - actualLeads;
    const accuracy = totalLeads > 0 ? ((actualLeads / targetLeads) * 100).toFixed(1) : '0';
    
    report += `👤 ${p.user_name}\n`;
    report += `   Kredi: ${p.credits} (${(p.target_share * 100).toFixed(1)}%)\n`;
    report += `   Hedef: ${targetLeads.toFixed(1)} lead\n`;
    report += `   Aldı: ${actualLeads} lead\n`;
    report += `   Doğruluk: ${accuracy}%\n`;
    report += `   Durum: ${deficit > 0 ? `❌ ${deficit.toFixed(1)} eksik` : deficit < 0 ? `⚠️ ${Math.abs(deficit).toFixed(1)} fazla` : '✅ Tam hedefte'}\n\n`;
  });
  
  report += `📈 Toplam: ${totalLeads} lead dağıtıldı\n`;
  
  return report;
}

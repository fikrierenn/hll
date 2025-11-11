/**
 * Lead Dağıtım Sistemi Mock API
 * Gerçek implementasyonda Supabase kullanılacak
 */

import { 
  WeeklyParticipation, 
  DailyQueueItem, 
  DailyDeficit,
  LeadAssignment,
  getWeekStart,
  getWeekEnd,
  formatDate,
  createDailyQueueFromParticipations,
  calculateDeficit
} from './index';

// Mock data storage
let weeklyParticipations: WeeklyParticipation[] = [];
let dailyQueue: DailyQueueItem[] = [];
let leadAssignments: LeadAssignment[] = [];
let dailyDeficits: DailyDeficit[] = [];

/**
 * Haftalık katılımları başlat
 */
export async function initializeWeeklyParticipations(
  participations: Array<{ user_id: string; user_name: string; credits: number }>
): Promise<WeeklyParticipation[]> {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  const totalCredits = participations.reduce((sum, p) => sum + p.credits, 0);
  
  weeklyParticipations = participations.map(p => ({
    id: `participation-${p.user_id}`,
    user_id: p.user_id,
    user_name: p.user_name,
    week_start: formatDate(weekStart),
    week_end: formatDate(weekEnd),
    credits: p.credits,
    total_credits: totalCredits,
    target_share: p.credits / totalCredits
  }));
  
  return weeklyParticipations;
}

/**
 * Aktif katılımcıları getir
 */
export async function getActiveParticipants(): Promise<WeeklyParticipation[]> {
  return weeklyParticipations;
}

/**
 * Günlük sıra oluştur
 */
export async function createDailyQueue(date: Date = new Date()): Promise<DailyQueueItem[]> {
  // Dünün deficitlerini al
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDeficits = await getDeficitsForDate(yesterday);
  
  // Deficit map oluştur
  const deficitMap: { [userId: string]: number } = {};
  yesterdayDeficits.forEach(d => {
    deficitMap[d.user_id] = d.cumulative_deficit;
  });
  
  // Sıra oluştur
  dailyQueue = createDailyQueueFromParticipations(weeklyParticipations, deficitMap);
  
  return dailyQueue;
}

/**
 * Bugünün sırasını getir
 */
export async function getTodayQueue(): Promise<DailyQueueItem[]> {
  return dailyQueue;
}

/**
 * Lead ata
 */
export async function assignLead(leadId: string): Promise<{ user_id: string; user_name: string }> {
  if (dailyQueue.length === 0) {
    throw new Error('Sırada kimse yok! Önce günlük sıra oluşturulmalı.');
  }
  
  // Sıradaki ilk kişiyi al
  const nextInLine = dailyQueue[0];
  
  // Lead ataması oluştur
  const assignment: LeadAssignment = {
    lead_id: leadId,
    user_id: nextInLine.user_id,
    assigned_at: new Date().toISOString(),
    week_start: weeklyParticipations[0].week_start,
    date: formatDate(new Date())
  };
  
  leadAssignments.push(assignment);
  
  // Sıradan çıkar, en sona ekle
  dailyQueue.shift();
  dailyQueue.push({ ...nextInLine, position: dailyQueue.length });
  
  // Pozisyonları güncelle
  dailyQueue.forEach((item, index) => {
    item.position = index;
  });
  
  return {
    user_id: nextInLine.user_id,
    user_name: nextInLine.user_name
  };
}

/**
 * Kullanıcının haftalık lead sayısını getir
 */
export async function getUserLeadsInWeek(userId: string, weekStart: string, endDate: string): Promise<number> {
  return leadAssignments.filter(a => 
    a.user_id === userId && 
    a.week_start === weekStart &&
    a.date <= endDate
  ).length;
}

/**
 * Haftalık toplam lead sayısını getir
 */
export async function getTotalLeadsInWeek(weekStart: string, endDate: string): Promise<number> {
  return leadAssignments.filter(a => 
    a.week_start === weekStart &&
    a.date <= endDate
  ).length;
}

/**
 * Günlük deficit hesapla
 */
export async function calculateDailyDeficit(date: Date = new Date()): Promise<DailyDeficit[]> {
  const dateStr = formatDate(date);
  const weekStart = weeklyParticipations[0]?.week_start;
  
  if (!weekStart) {
    throw new Error('Haftalık katılım bulunamadı!');
  }
  
  const totalLeadsThisWeek = await getTotalLeadsInWeek(weekStart, dateStr);
  const deficits: DailyDeficit[] = [];
  
  for (const p of weeklyParticipations) {
    const actualLeads = await getUserLeadsInWeek(p.user_id, weekStart, dateStr);
    const targetLeads = p.target_share * totalLeadsThisWeek;
    const deficit = calculateDeficit(p.target_share, totalLeadsThisWeek, actualLeads);
    
    // Önceki günün kümülatif deficitini al
    const previousDeficit = await getPreviousDeficit(p.user_id, date);
    const cumulativeDeficit = previousDeficit + deficit;
    
    const deficitRecord: DailyDeficit = {
      user_id: p.user_id,
      user_name: p.user_name,
      date: dateStr,
      target_leads: targetLeads,
      actual_leads: actualLeads,
      deficit: deficit,
      cumulative_deficit: cumulativeDeficit
    };
    
    deficits.push(deficitRecord);
  }
  
  // Kaydet
  dailyDeficits = [...dailyDeficits.filter(d => d.date !== dateStr), ...deficits];
  
  return deficits;
}

/**
 * Önceki günün deficitini getir
 */
async function getPreviousDeficit(userId: string, date: Date): Promise<number> {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);
  
  const deficit = dailyDeficits.find(d => d.user_id === userId && d.date === yesterdayStr);
  return deficit?.cumulative_deficit || 0;
}

/**
 * Belirli bir tarihin deficitlerini getir
 */
async function getDeficitsForDate(date: Date): Promise<DailyDeficit[]> {
  const dateStr = formatDate(date);
  return dailyDeficits.filter(d => d.date === dateStr);
}

/**
 * Tüm verileri sıfırla (test için)
 */
export function resetAllData() {
  weeklyParticipations = [];
  dailyQueue = [];
  leadAssignments = [];
  dailyDeficits = [];
}

/**
 * Mevcut durumu getir (debug için)
 */
export function getCurrentState() {
  return {
    participations: weeklyParticipations,
    queue: dailyQueue,
    assignments: leadAssignments,
    deficits: dailyDeficits
  };
}

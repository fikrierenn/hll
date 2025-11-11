/**
 * Lead Dağıtım Algoritması Test Senaryosu
 * 
 * Senaryo: 3 temsilci, 7 gün, değişken lead sayıları
 */

import {
  initializeWeeklyParticipations,
  createDailyQueue,
  assignLead,
  calculateDailyDeficit,
  getCurrentState,
  resetAllData
} from './mock-api';
import { generateWeeklyReport } from './index';

export async function runTestScenario() {
  console.log('🚀 Lead Dağıtım Algoritması Test Başlıyor...\n');
  
  // Verileri sıfırla
  resetAllData();
  
  // 1. Haftalık katılımları başlat
  console.log('📋 Haftalık Katılımlar:');
  const participations = await initializeWeeklyParticipations([
    { user_id: '1', user_name: 'Ayşe Yılmaz', credits: 5 },
    { user_id: '2', user_name: 'Mehmet Kaya', credits: 2 },
    { user_id: '3', user_name: 'Zeynep Demir', credits: 1 }
  ]);
  
  participations.forEach(p => {
    console.log(`   ${p.user_name}: ${p.credits} kredi (${(p.target_share * 100).toFixed(1)}% pay)`);
  });
  console.log(`   Toplam: ${participations[0].total_credits} kredi\n`);
  
  // 2. Günlük simülasyon
  const dailyLeadCounts = [16, 12, 20, 8, 24, 15, 10]; // 7 günlük lead sayıları
  const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  
  for (let day = 0; day < 7; day++) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📅 ${dayNames[day]} - Gün ${day + 1}`);
    console.log('='.repeat(60));
    
    // Günlük sıra oluştur
    const queue = await createDailyQueue();
    console.log(`\n🎯 Günlük Sıra Oluşturuldu (${queue.length} slot):`);
    
    // Sıradaki ilk 10 kişiyi göster
    const preview = queue.slice(0, 10).map(q => q.user_name.split(' ')[0]).join(' → ');
    console.log(`   ${preview}...`);
    
    // Slot dağılımını göster
    const slotCounts: { [name: string]: number } = {};
    queue.forEach(q => {
      slotCounts[q.user_name] = (slotCounts[q.user_name] || 0) + 1;
    });
    console.log('\n   Slot Dağılımı:');
    Object.entries(slotCounts).forEach(([name, count]) => {
      console.log(`   - ${name}: ${count} slot`);
    });
    
    // Lead'leri dağıt
    const leadCount = dailyLeadCounts[day];
    console.log(`\n📨 ${leadCount} Lead Dağıtılıyor...`);
    
    const assignments: { [name: string]: number } = {};
    for (let i = 0; i < leadCount; i++) {
      const result = await assignLead(`lead-day${day + 1}-${i + 1}`);
      assignments[result.user_name] = (assignments[result.user_name] || 0) + 1;
    }
    
    console.log('\n   Dağıtım Sonucu:');
    Object.entries(assignments).forEach(([name, count]) => {
      console.log(`   ✅ ${name}: ${count} lead`);
    });
    
    // Günlük deficit hesapla
    const deficits = await calculateDailyDeficit();
    console.log('\n📊 Günlük Deficit Analizi:');
    deficits.forEach(d => {
      const status = d.deficit > 0 ? '❌ Eksik' : d.deficit < 0 ? '⚠️ Fazla' : '✅ Hedefte';
      console.log(`   ${d.user_name}:`);
      console.log(`      Hedef: ${d.target_leads.toFixed(1)} | Aldı: ${d.actual_leads} | Deficit: ${d.deficit.toFixed(1)} ${status}`);
      console.log(`      Kümülatif Deficit: ${d.cumulative_deficit.toFixed(1)}`);
    });
  }
  
  // 3. Haftalık özet
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('📈 HAFTALIK ÖZET RAPOR');
  console.log('='.repeat(60));
  
  const state = getCurrentState();
  const assignmentCounts: { [userId: string]: number } = {};
  
  state.assignments.forEach(a => {
    assignmentCounts[a.user_id] = (assignmentCounts[a.user_id] || 0) + 1;
  });
  
  const report = generateWeeklyReport(participations, assignmentCounts);
  console.log('\n' + report);
  
  // 4. Detaylı istatistikler
  console.log('\n📊 Detaylı İstatistikler:');
  console.log(`   Toplam Lead: ${state.assignments.length}`);
  console.log(`   Günlük Ortalama: ${(state.assignments.length / 7).toFixed(1)}`);
  
  const leadsPerCredit = state.assignments.length / participations[0].total_credits;
  console.log(`   Lead/Kredi Oranı: ${leadsPerCredit.toFixed(2)}`);
  
  console.log('\n✅ Test Tamamlandı!\n');
  
  return state;
}

// Test'i çalıştır
if (require.main === module) {
  runTestScenario().catch(console.error);
}

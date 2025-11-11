# Akıllı Lead Dağıtım Algoritması

## Sistem Özeti

**Hibrit Yaklaşım:** Gerçek zamanlı Round-Robin + Günlük Deficit Telafisi

### Temel Prensipler
1. **Haftalık Kredi Sistemi:** Her temsilci hafta başı kredi satın alır (500 TL = 1 kredi)
2. **Gerçek Zamanlı Dağıtım:** Lead geldiği anda sıradaki temsilciye atanır
3. **Ağırlıklı Sıra:** Kredi sayısı kadar sıraya girilir (5 kredi = 5 slot)
4. **Günlük Telafi:** Her gün sonu eksiklik hesaplanır, ertesi gün sırası ayarlanır
5. **Haftalık Adalet:** Hafta sonunda herkes kredisi oranında lead almış olur

## Veritabanı Şeması

### 1. weekly_participation
Haftalık kredi katılımları
```sql
CREATE TABLE weekly_participation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  credits INTEGER NOT NULL,
  total_credits INTEGER NOT NULL, -- Haftalık toplam kredi
  target_share DECIMAL(5,4) NOT NULL, -- credits / total_credits
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. daily_distribution_queue
Günlük dağıtım sırası
```sql
CREATE TABLE daily_distribution_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  user_id UUID REFERENCES users(id),
  position INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  slots_in_queue INTEGER NOT NULL, -- Kaç slot'a sahip
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, position)
);
```

### 3. lead_assignments
Lead atamaları
```sql
CREATE TABLE lead_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  user_id UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  week_start DATE NOT NULL,
  date DATE NOT NULL
);
```

### 4. daily_deficit_log
Günlük eksiklik takibi
```sql
CREATE TABLE daily_deficit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  target_leads DECIMAL(10,2) NOT NULL,
  actual_leads INTEGER NOT NULL,
  deficit DECIMAL(10,2) NOT NULL, -- target - actual
  cumulative_deficit DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

## Algoritma Akışı

### Hafta Başı (Pazartesi Sabahı)
```javascript
function initializeWeek() {
  // 1. Haftalık katılımları al
  const participations = await getWeeklyParticipations();
  
  // 2. Toplam kredi hesapla
  const totalCredits = participations.reduce((sum, p) => sum + p.credits, 0);
  
  // 3. Her temsilci için hedef payı hesapla
  for (const p of participations) {
    p.target_share = p.credits / totalCredits;
    await updateParticipation(p);
  }
  
  // 4. İlk günün sırasını oluştur
  await createDailyQueue(participations);
}
```

### Her Gün Sabah (Sıra Oluşturma)
```javascript
function createDailyQueue(date) {
  // 1. Dünün deficit'ini al
  const deficits = await getYesterdayDeficits(date);
  
  // 2. Bugünün katılımcılarını al
  const participants = await getActiveParticipants(date);
  
  // 3. Her temsilci için slot sayısını hesapla
  const participantSlots = [];
  for (const p of participants) {
    const deficit = deficits[p.user_id] || 0;
    
    // Base slots: kredi sayısı
    let slots = p.credits;
    
    // Deficit telafisi: Her 1 eksik için +1 slot
    if (deficit > 0) {
      slots += Math.floor(deficit);
    }
    // Fazla almışsa: Her 1 fazla için -1 slot (minimum 1)
    else if (deficit < 0) {
      slots = Math.max(1, slots + Math.ceil(deficit));
    }
    
    participantSlots.push({
      user_id: p.user_id,
      user_name: p.user_name,
      credits: p.credits,
      slots: slots
    });
  }
  
  // 4. Round-Robin Karışık sıralama oluştur
  const queue = createRoundRobinQueue(participantSlots);
  
  // 5. Veritabanına kaydet
  await saveDailyQueue(date, queue);
}

/**
 * Round-Robin Karışık Sıralama
 * Her tur, tüm katılımcılar 1'er slot alır
 * Kredisi biten sıradan çıkar
 */
function createRoundRobinQueue(participants) {
  const queue = [];
  const remaining = participants.map(p => ({ ...p, remaining: p.slots }));
  
  // Turlar halinde dağıt
  while (remaining.some(p => p.remaining > 0)) {
    // Bu turda slot alacaklar
    const activeInRound = remaining.filter(p => p.remaining > 0);
    
    // Aynı turdakileri kendi aralarında karıştır (adalet için)
    shuffle(activeInRound);
    
    // Her birine 1 slot ver
    for (const p of activeInRound) {
      queue.push({
        user_id: p.user_id,
        user_name: p.user_name,
        credits: p.credits,
        position: queue.length
      });
      p.remaining--;
    }
  }
  
  return queue;
}
```

### Lead Geldiğinde (Gerçek Zamanlı)
```javascript
async function assignLead(lead) {
  // 1. Bugünün sırasını al
  const queue = await getTodayQueue();
  
  if (queue.length === 0) {
    throw new Error('Sırada kimse yok!');
  }
  
  // 2. Sıradaki ilk kişiyi al
  const nextInLine = queue[0];
  
  // 3. Lead'i ata
  await createLeadAssignment({
    lead_id: lead.id,
    user_id: nextInLine.user_id,
    assigned_at: new Date(),
    week_start: getCurrentWeekStart(),
    date: new Date()
  });
  
  // 4. Sıradan çıkar, en sona ekle
  await moveToEndOfQueue(nextInLine);
  
  // 5. Bildirim gönder
  await sendNotification(nextInLine.user_id, lead);
  
  return nextInLine.user_id;
}
```

### Her Gün Sonu (Deficit Hesaplama)
```javascript
async function calculateDailyDeficit(date) {
  const participants = await getActiveParticipants(date);
  const weekStart = getWeekStart(date);
  
  // 1. Hafta başından bugüne kadar toplam lead
  const totalLeadsThisWeek = await getTotalLeadsInWeek(weekStart, date);
  
  for (const p of participants) {
    // 2. Bu temsilcinin hedefi
    const targetLeads = p.target_share * totalLeadsThisWeek;
    
    // 3. Gerçekte aldığı lead
    const actualLeads = await getUserLeadsInWeek(p.user_id, weekStart, date);
    
    // 4. Eksiklik
    const deficit = targetLeads - actualLeads;
    
    // 5. Kümülatif eksiklik (önceki günlerden gelen)
    const previousDeficit = await getPreviousDeficit(p.user_id, date);
    const cumulativeDeficit = previousDeficit + deficit;
    
    // 6. Kaydet
    await saveDailyDeficit({
      user_id: p.user_id,
      date: date,
      target_leads: targetLeads,
      actual_leads: actualLeads,
      deficit: deficit,
      cumulative_deficit: cumulativeDeficit
    });
  }
}
```

## Örnek Senaryo

### Katılımcılar
- **Ayşe:** 5 kredi (500 TL × 5 = 2500 TL)
- **Mehmet:** 2 kredi (500 TL × 2 = 1000 TL)
- **Zeynep:** 1 kredi (500 TL × 1 = 500 TL)
- **Toplam:** 8 kredi

### Hedef Paylar
- Ayşe: 5/8 = 62.5%
- Mehmet: 2/8 = 25%
- Zeynep: 1/8 = 12.5%

### Gün 1 (Pazartesi)
**Sabah Sırası (Round-Robin Karışık):**
```
Tur 1: [A, M, Z]  (herkes 1)
Tur 2: [A, M]     (Z bitti)
Tur 3: [A]        (M bitti)
Tur 4: [A]
Tur 5: [A]

Final Sıra: [A,M,Z,A,M,A,A,A]
```

**16 lead geldi:**
```
Lead 1 → A
Lead 2 → M
Lead 3 → Z ✅ (ilk 3'te herkes aldı!)
Lead 4 → A
Lead 5 → M
Lead 6 → A
Lead 7 → A
Lead 8 → A (tur bitti, başa dön)
Lead 9 → A
Lead 10 → M
Lead 11 → Z
...
```

**Sonuç:**
- Ayşe: 10 lead aldı (hedef: 10) → deficit: 0
- Mehmet: 4 lead aldı (hedef: 4) → deficit: 0
- Zeynep: 2 lead aldı (hedef: 2) → deficit: 0

### Gün 2 (Salı)
**Hafta toplamı:** 16 lead
**Hedefler:**
- Ayşe: 10 lead
- Mehmet: 4 lead
- Zeynep: 2 lead

**Sabah Sırası:** (deficit yok, normal Round-Robin)
```
[A,M,Z,A,M,A,A,A]
```

**12 lead geldi:**
- Ayşe: 7 lead aldı (hedef: 17.5) → deficit: +10.5
- Mehmet: 3 lead aldı (hedef: 7) → deficit: +4
- Zeynep: 2 lead aldı (hedef: 3.5) → deficit: +1.5

### Gün 3 (Çarşamba)
**Kümülatif deficit:**
- Ayşe: +10.5 (eksik)
- Mehmet: +4 (eksik)
- Zeynep: +1.5 (eksik)

**Sabah Sırası:** (telafi ile Round-Robin)
```
Ayşe: 5 + 10 = 15 slot
Mehmet: 2 + 4 = 6 slot
Zeynep: 1 + 1 = 2 slot

Tur 1: [A, M, Z]
Tur 2: [A, M, Z]
Tur 3: [A, M]
Tur 4: [A, M]
Tur 5: [A, M]
Tur 6: [A, M]
Tur 7-15: [A, A, A, A, A, A, A, A, A]

Final: [A,M,Z,A,M,Z,A,M,A,M,A,M,A,M,A,A,A,A,A,A,A,A,A]
```

**20 lead geldi:**
- Ayşe: 13 lead aldı → deficit azalır
- Mehmet: 5 lead aldı → deficit azalır
- Zeynep: 2 lead aldı → deficit azalır

**Not:** Zeynep ilk 3 lead'de garantili aldı! ✅

### Hafta Sonu
Tüm deficitler sıfırlanır, herkes hedef oranında lead almış olur.

## Cron Jobs

### 1. Hafta Başı İnit (Pazartesi 00:00)
```javascript
cron.schedule('0 0 * * 1', async () => {
  await initializeWeek();
});
```

### 2. Günlük Sıra Oluşturma (Her gün 00:00)
```javascript
cron.schedule('0 0 * * *', async () => {
  await createDailyQueue(new Date());
});
```

### 3. Günlük Deficit Hesaplama (Her gün 23:55)
```javascript
cron.schedule('55 23 * * *', async () => {
  await calculateDailyDeficit(new Date());
});
```

## Avantajlar

✅ **Gerçek zamanlı:** Lead geldiği anda atanır
✅ **Adil:** Hafta sonunda herkes oranında lead alır
✅ **Telafi:** Eksik alanlar ertesi gün öne geçer
✅ **Basit:** Sıra sistemi anlaşılır
✅ **Esnek:** Hafta ortası kredi değişimi desteklenebilir
✅ **Şeffaf:** Her gün deficit görülebilir

## Notlar

- Lead atama transaction içinde yapılmalı (race condition önlemi)
- Sıra Redis'te cache'lenebilir (performans)
- Günlük raporlar otomatik oluşturulmalı
- Haftalık özet email gönderilmeli

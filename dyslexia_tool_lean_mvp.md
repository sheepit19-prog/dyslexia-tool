# Dyslexia Assistive Tool - Lean MVP Plan

> Tek özellikle başla, validate et, sonra genişlet

---

## 🎯 MVP Seçenekleri (Tek Özellik)

### Seçenek 1: Chrome Extension - "Dyslexia Reader" ⭐ ÖNERİLEN

**Ne yapar?**
- Herhangi bir web sayfasını tek tıkla dyslexia-friendly hale getirir
- OpenDyslexic font + line spacing + contrast
- Text-to-speech (seçili alanı okur)
- Highlighting ruler

**Neden bu?**
- En düşük development maliyeti
- Anında kullanılabilir (kurulum yok)
- Viral growth (öğretmen→öğrenci→ebeveyn)
- Daily utility (sürekli kullanım)

```
🎯 Target: Öğrenciler ve knowledge workers
💰 Monetization: Freemium (ücretsiz temel, $3/ay premium)
📈 Growth: Chrome Web Store + word of mouth
```

---

### Seçenek 2: Mobile App - "Voice PDF Reader"

**Ne yapar?**
- PDF'leri import et, sesli dinle
- Sadece bu, başka bir şey yok

**Neden bu?**
- Offline çalışır
- PDF = akademik içerik = disleksili kullanıcıların ana ihtiyacı
- Basit UI = düşük design maliyeti

---

### Seçenek 3: Web App - "Focus Writer"

**Ne yapar?**
- Dyslexia-friendly text editor
- Distraction-free, sesli geri bildirim
- Auto-save, export

---

## 💰 Lean MVP Maliyet Analizi

### Chrome Extension MVP

| Bileşen | Maliyet (USD) | Süre | Notlar |
|---------|--------------|------|--------|
| **UI/UX Design** | $1.500-3.000 | 2-3 hafta | Figma, basit arayüz |
| **Extension Development** | $5.000-8.000 | 3-4 hafta | Vanilla JS + Chrome APIs |
| **TTS Integration** | $500-1.000 | 1 hafta | Browser native TTS API (ücretsiz) |
| **Backend (minimal)** | $2.000-3.000 | 2 hafta | Firebase/Supabase |
| **Landing Page** | $500-1.000 | 1 hafta | Webflow/Framer |
| **Testing** | $500-1.000 | 1 hafta | Beta kullanıcıları |
| **Chrome Web Store** | $25 | - | Developer ücreti |
| **TOTAL** | **$10.000-17.000** | **8-12 hafta** | (~2-3 ay) |

### Bare Minimum Versiyon (Daha da Lean)

| Bileşen | Maliyet | Süre |
|---------|---------|------|
| Freelancer (Pakistan/Doğu Avrupa) | $3.000-5.000 | 6-8 hafta |
| Design (Tailwind UI + tweak) | $500-1.000 | 1 hafta |
| Backend (Firebase Spark - free tier) | $0 | - |
| TTS (Web Speech API - free) | $0 | - |
| **TOTAL** | **$3.500-6.000** | **2 ay** |

---

## 📊 Farklı Geliştirme Modelleri

### Model A: Freelancer (En Ucuz)

```
Developer: Upwork/Toptal'dan $25-40/saat
├── Backend: Firebase (ücretsiz tier)
├── Frontend: Vanilla JS + Chrome APIs
├── Design: Hazır UI kit + basit tweak
└── Toplam: $5.000-8.000 (2-3 ay)
```

### Model B: No-Code Hybrid

```
Landing: Webflow ($14/ay)
Extension: Bubble plugin + custom JS
Backend: Airtable/Supabase
├── Maliyet: $2.000-4.000
├── Süre: 4-6 hafta
└── Sınırlama: Chrome extension zor, web app daha kolay
```

### Model C: Indie Hacker (Siz Yapın)

```
Eğer teknik beceriniz varsa:
├── Zaman: 3-6 ay (part-time)
├── Maliyet: $500-1.000 (sadece araçlar/hosting)
├── Araçlar: Cursor AI, Vercel, Supabase
└── Gelir beklentisi: Aylık $1.000'da bile karlı
```

---

## 🚀 Growth Path (Single Feature → Platform)

### Phase 1: Chrome Extension (Ay 0-3)

**Özellikler:**
- [ ] Web sayfalarını dyslexia-friendly render etme
- [ ] Font değiştirme (OpenDyslexic)
- [ ] Line spacing, contrast ayarları
- [ ] Temel TTS (seçili text'i okuma)

**Hedef:**
- 1.000+ Chrome Web Store indirme
- %20 weekly active user
- 50+ ödeme yapan (premium)

**Gelir:** $150-500/ay

---

### Phase 2: Mobile Companion (Ay 4-8)

**Yeni özellik:**
- iOS/Android app
- Safari/Chrome mobile extension
- Cross-device sync (okuma listeleri, ayarlar)

**Yatırım:** $10.000-15.000 daha

**Hedef:**
- 5.000+ toplam kullanıcı
- $2.000-5.000 MRR

---

### Phase 3: Writing Assistant (Ay 9-15)

**Yeni özellik:**
- AI destekli yazma asistanı
- Spell check (dyslexia-optimized)
- Grammar suggestions

**Yatırım:** $15.000-25.000 (AI entegrasyonu)

**Hedef:**
- 20.000+ kullanıcı
- $10.000+ MRR
- B2B okul anlaşmaları başlar

---

### Phase 4: Full Platform (Yıl 2+)

**Tüm özellikler:**
- Reading + Writing + Study tools
- LMS entegrasyonları
- Teacher dashboard

---

## 💵 Lean Finansal Projeksiyon

### İlk 12 Ay (Single Feature)

| Ay | Geliştirme | Marketing | Gelir | Net | Kümülatif |
|----|-----------|-----------|-------|-----|-----------|
| 1-3 | $8.000 | $500 | $0 | -$8.500 | -$8.500 |
| 4-6 | $2.000 | $1.000 | $300 | -$2.700 | -$11.200 |
| 7-9 | $1.000 | $1.500 | $800 | -$1.700 | -$12.900 |
| 10-12 | $1.000 | $2.000 | $1.500 | -$1.500 | -$14.400 |

**İlk yıl toplam yatırım: ~$15.000**

---

### İkinci Yıl (Platforma dönüşüm)

| Çeyrek | Gelir | Maliyet | Kar |
|--------|-------|---------|-----|
| Q1 | $5.000 | $6.000 | -$1.000 |
| Q2 | $10.000 | $8.000 | $2.000 |
| Q3 | $20.000 | $12.000 | $8.000 |
| Q4 | $35.000 | $18.000 | $17.000 |

**İkinci yıl sonunda: Aylık $15.000+ MRR, karlı işletme**

---

## ✅ Karşılaştırma: Full MVP vs Lean MVP

| Kriter | Full MVP | Lean MVP (Chrome Ext) |
|--------|----------|----------------------|
| **Başlangıç maliyeti** | $75.000-133.000 | $5.000-10.000 |
| **Time to market** | 4-6 ay | 2-3 ay |
| **Risk** | Yüksek | Düşük |
| **Validation hızı** | Yavaş | Hızlı |
| **Pivot esnekliği** | Zor | Kolay |
| **İlk gelir** | Ay 12+ | Ay 3-4 |
| **Break-even** | Ay 24-30 | Ay 8-12 |

---

## 🎯 Önerilen Eylem Planı

### Hemen Başlayabileceğiniz Adımlar

**Hafta 1-2: Validation**
```
- 10 disleksili öğrenci/anne-baba ile görüş
- Chrome Web Store'daki mevcut extension'ları test et
- Reddit r/dyslexia'da fikri tartış
- Basit bir landing page yap (email topla)
Maliyet: $0 (sadece zaman)
```

**Hafta 3-6: Design & Prototype**
```
- Figma'da mockup'lar
- Basit HTML prototype
- User testing 5 kişiyle
Maliyet: $1.000-2.000 (designer)
```

**Hafta 7-12: Development**
```
- Freelancer bul (Upwork/Toptal)
- Weekly milestone'lar
- Chrome Web Store'a submit
Maliyet: $5.000-8.000
```

**Ay 4+: Launch & Iterate**
```
- Chrome Web Store'da yayınla
- Reddit, Product Hunt, Twitter'da tanıtım
- User feedback topla
- Premium özellikleri ekle
Maliyet: $500/ay (marketing)
```

---

## 🏆 Başarı Ölçütleri (Lean MVP)

| Metrik | Hedef | Zaman |
|--------|-------|-------|
| Chrome Web Store installs | 1.000 | Ay 3 |
| Weekly Active Users | 400 (%40) | Ay 3 |
| Premium conversion | %5 (50 kişi) | Ay 6 |
| MRR | $500 | Ay 6 |
| Organic growth | %50 trafik | Ay 6 |
| User rating | 4.5+ yıldız | Sürekli |

---

## 💡 Altın Kurallar (Lean Approach)

1. **"Perfect is the enemy of good"** - Çalışan bir şey yap, kusursuz değil
2. **"Talk to users"** - Her hafta en az 1 kullanıcı ile görüş
3. **"Charge early"** - Ücretsiz kullanıcılar yanlış feedback verir
4. **"Build in public"** - Twitter/LinkedIn'de geliştirme sürecini paylaş
5. **"Copy smart"** - Mevcut extension'ları incele, eksiklerini tamamla

---

## 📚 Örnek: Benzer Başarı Hikayeleri

### Grammarly
- Başladı: Sadece spell check Chrome extension
- Şimdi: $1B+ değerleme, full writing platform

### Honey
- Başladı: Sadece kupon bulucu extension
- Satıldı: PayPal'a $4B

### Loom
- Başladı: Sadece screen recorder Chrome extension
- Şimdi: $1.5B+ değerleme

**Pattern:** Chrome extension → validate → platform → scale

---

## 🚀 Sonuç

**Evet, tek bir tool yeterli!** Hatta önerilen yol bu.

### Özet:
- **Başlangıç bütçesi:** $5.000-10.000 (vs $100.000+)
- **Time to market:** 2-3 ay (vs 6 ay)
- **Risk:** Düşük, validate ederek ilerleme
- **Büyüme:** Chrome Web Store'da 1.000+ user ile başla, platforma dönüş

### Tek Yapmanız Gereken:
**"Dyslexia Reader" Chrome Extension'ı** - web sayfalarını okunabilir hale getiren basit bir araç.

Sonra: Kullanıcılar istedikçe özellik ekle (mobile, writing, vs.)

---

*Plan Tarihi: Ocak 2025*
*Sonraki Adım: Validation (10 kullanıcı ile görüşme)*

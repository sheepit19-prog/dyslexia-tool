# Dyslexia Reader - MVP Gelistirme Plani

## Context

Disleksi, dunya nufusunun %5-10'unu (400-800 milyon kisi) etkileyen bir okuma guclugu. Mevcut araclar ya cok pahali (Read&Write Gold: $200-500/yil, Kurzweil: $2000) ya da disleksiye ozel degil (Speechify, NaturalReader). $450M buyuklugundeki pazar yillik %13 buyuyor. Bu projede modern, ucretsiz + premium, kullanici dostu bir disleksi araci gelistiriyoruz.

**Hedef:** Chrome Extension ile baslayip, web app + mobil app'e genisleyen, global (Ingilizce) pazara yonelik bir urun.

**Yaklasim:** Claude Code ile birlikte adim adim gelistirme.

---

## Faz 1: Chrome Extension MVP (Hafta 1-4)

### Temel Ozellikler (Sadece 2)
1. **Disleksi Dostu Okuma Modu** - OpenDyslexic font, harf/satir/kelime araligi ayarlari, arka plan renk temalari
2. **Metin-Konusma (TTS)** - Secili metni sesli oku, kelime vurgulama, hiz kontrolu

### Tech Stack

| Katman | Secim | Neden |
|--------|-------|-------|
| Extension Framework | **WXT (wxt.dev)** | Vite tabanli, HMR, Manifest V3, dosya-bazli entrypoint'ler |
| Dil | **TypeScript** | Tip guvenligi, IDE destegi |
| Popup UI | **React 18 + Tailwind CSS** | Web app ile kod paylasimi, hizli gelistirme |
| Content Script | **Vanilla CSS injection** | Hafif, performansli, framework gereksiz |
| TTS | **chrome.tts API** | Sistem sesleri, SSML destegi, kelime siniri olaylari |
| Font | **OpenDyslexic (SIL-OFL)** | Ucretsiz, extension icine gomulu |
| State | **chrome.storage.sync** | Cihazlar arasi senkronizasyon, backend gereksiz |
| Build | **Vite (WXT uzerinden)** | Hizli build, tree-shaking |

### V1.0'da Backend YOK
- Tum ayarlar `chrome.storage.sync` ile saklanir (Chrome'un kendi sync mekanizmasi)
- Kullanici hesabi, odeme sistemi V1.1'e birakilir
- Bu, gelistirme suresini 2+ hafta kisaltir

### Mimari

```
[Web Sayfasi] <-- content script CSS enjekte eder --> [Content Script]
        |                                                    |
        | chrome.runtime.sendMessage()                       |
        v                                                    |
  [Service Worker (background)]                              |
        |-- chrome.tts.speak() (TTS)                         |
        |-- chrome.storage.sync (ayarlar)                    |
        |-- Context menu yonetimi                            |
  [Popup (React)]                                            |
        |-- Ana acma/kapama toggle                           |
        |-- Font kontrolleri (slider'lar)                    |
        |-- TTS kontrolleri (oynat/durdur/hiz)               |
```

### Hafta Hafta Plan

**Hafta 1: Temel + Okuma Modu**
- Gun 1: Proje iskele (WXT + monorepo + TypeScript + ESLint)
- Gun 1: OpenDyslexic font entegrasyonu (@font-face, .woff2)
- Gun 2: Content script - CSS enjeksiyon sistemi (CSS custom properties)
- Gun 2: chrome.storage.sync sarmalayicisi (tipli ayarlar, varsayilanlar)
- Gun 3: Popup UI kabugu (React + Tailwind, ana toggle, sekmeli yapi)
- Gun 3: Font kontrolleri (font boyutu, harf araligi, satir yuksekligi, kelime araligi slider'lari)
- Gun 4: 4 arka plan renk temasi (krem, mavi, yesil, yuksek kontrast)
- Gun 5: Site bazli ayarlar + 10+ sitede test

**Hafta 2: Text-to-Speech**
- Gun 6: TTS motor sarmalayicisi (chrome.tts, ses listeleme, oynat/durdur/devam)
- Gun 6: Metin secim isleme (content script'ten temiz metin cikarma)
- Gun 7: Sag-tik context menu ("Sesli Oku") + popup TTS kontrolleri
- Gun 8: Kelime vurgulama (chrome.tts olay sinirlari + TreeWalker)
- Gun 8: Uzun metin parcalama (cumle/paragraf sinirlari, kuyruk yonetimi)
- Gun 9: Kenar durumlari (sayfa degisimi, sekme gecisi, popup kapanmasi)
- Gun 10: Entegrasyon testi (okuma modu + TTS birlikte)

**Hafta 3: Cila + Magaza Hazirligi**
- Gun 11: Erisilebilirlik denetimi (klavye navigasyonu, ARIA etiketleri)
- Gun 11: Ilk kurulum karsilama/rehber akisi
- Gun 12: Ikon ve marka (16/32/48/128px ikonlar)
- Gun 12: Klavye kisayollari (Alt+D toggle, Alt+R sesli oku)
- Gun 13: Performans optimizasyonu + hata yonetimi
- Gun 14: Chrome Web Store varliklari (ekran goruntuleri, aciklama, gizlilik politikasi)
- Gun 15: Final QA (20+ site testi)

**Hafta 4: Lansman**
- Gun 16: Chrome Web Store'a gonder
- Gun 16: Minimal landing page (Next.js static, Vercel'de)
- Gun 17-18: Analitik entegrasyonu
- Gun 19: Topluluk paylasimi (Reddit, Product Hunt, Twitter/LinkedIn)
- Gun 20: V1.1 planlama baslangici

### Dosya/Klasor Yapisi (Monorepo)

```
dyslexia-reader/
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── turbo.json
│
├── packages/
│   ├── core/                    # PAYLASILAN: Saf TypeScript mantigi
│   │   └── src/
│   │       ├── settings/        # Ayar semalari, varsayilanlar, dogrulama
│   │       ├── tts/             # Metin parcalama, kuyruk yonetimi
│   │       ├── text/            # Metin isleme ve temizleme
│   │       ├── features/        # Ozellik gecitleri (ucretsiz vs premium)
│   │       └── theme/           # Renk paletleri, font yapisi, CSS uretimi
│   │
│   ├── ui/                      # PAYLASILAN: React bilesenleri
│   │   └── src/
│   │       ├── components/      # Slider, Toggle, VoiceSelector, FontPreview
│   │       └── hooks/           # useSettings, useTTS
│   │
│   └── assets/                  # PAYLASILAN: Fontlar ve ikonlar
│       ├── fonts/               # OpenDyslexic .woff2
│       └── icons/               # Uygulama ikonlari
│
├── apps/
│   ├── extension/               # FAZ 1: Chrome Extension (WXT)
│   │   ├── wxt.config.ts
│   │   ├── entrypoints/
│   │   │   ├── background.ts    # Service worker
│   │   │   ├── content/         # Content script (CSS enjeksiyonu + vurgulama)
│   │   │   ├── popup/           # Popup UI (React)
│   │   │   └── options/         # Ayarlar sayfasi (v1.1)
│   │   ├── components/          # Popup'a ozel bilesenler
│   │   └── lib/                 # storage.ts, tts-engine.ts, css-injector.ts
│   │
│   ├── web/                     # FAZ 2: Next.js (Landing + Web App)
│   │   └── app/
│   │       ├── (marketing)/     # Landing page rotalari
│   │       └── (app)/           # Web app rotalari (okuyucu, ayarlar)
│   │
│   └── mobile/                  # FAZ 3: Expo (React Native)
│       └── app/                 # Expo Router
```

---

## Faz 2: Web Sitesi + Web App (Hafta 5-8)

### Landing Page (Pazarlama)
- **Tech:** Next.js 14 static export, Vercel'de ucretsiz hosting
- Hero bolumu, ozellik demo'lari (GIF/video), "Chrome'a Ekle" CTA
- Fiyatlandirma sayfasi, SSS, gizlilik politikasi
- SEO: "dyslexia chrome extension", "reading aid for dyslexia" hedef anahtar kelimeler

### Web Uygulamasi
- Metin yapistir + disleksi dostu modda oku
- TTS (Web Speech API)
- Ayni React + Tailwind tasarim dili
- Supabase entegrasyonu (auth, kullanici ayarlari senkronizasyonu)

### Neden Next.js?
- Landing page icin SSR/SSG (SEO)
- Web app icin dinamik rotalar
- Extension ile ayni React + Tailwind stack'i
- Vercel ucretsiz katmani yeterli

---

## Faz 3: Mobil Uygulama (Hafta 9-14)

- **Tech:** Expo (React Native) - tek kodla iOS + Android
- `packages/core` mantigi paylasilir
- TTS: `expo-speech` kutuphanesi
- Storage: AsyncStorage (adapter pattern ile)
- UI: React Native primitifleri ile yeniden olusturma (View, Text vs div, span)

---

## Ucretsiz vs Premium Strateji

### V1.0 Lansman: HERSEY UCRETSIZ
- Yuklemeleri maksimize et, yorum ve puan topla
- Kullanici davranisi verisi topla (neyi en cok kullaniyorlar?)

### V1.1 (Hafta 6-8): Freemium Gecisi

**Ucretsiz Katman (sonsuza kadar):**
- OpenDyslexic font acma/kapama
- 3 hazir aralik ayari (siki, normal, genis)
- Temel TTS: varsayilan ses, sabit hiz (1.0x)
- 2 arka plan temasi (krem, varsayilan)

**Pro Katman ($5.99/ay veya $49.99/yil):**
- Tam slider kontrolu (harf, kelime, satir araligi, boyut)
- Tum renk temalari + ozel renk secici
- Gelismis TTS: tum sesler, hiz kontrolu (0.5x-2.0x), tam sayfa okuma
- Kelime bazli vurgulama
- Site bazli ayarlar
- Okuma cetveli / satir odak kaplama
- Oncelikli destek

### Fiyatlandirma Mantigi
- $5.99/ay: Speechify'in ($11.58) ve NaturalReader'in ($9.99) altinda
- Yillik plan $49.99 (~$4.17/ay): Cazip indirim, daha iyi retention

---

## Kod Paylasim Stratejisi

### Adapter Pattern (Platform Bagimsizligi)

```typescript
// packages/core/src/adapters/types.ts
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
}

interface TTSAdapter {
  speak(text: string, options: TTSOptions): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  getVoices(): Promise<Voice[]>;
}
```

Her platform kendi adapter'ini yazar:
- Extension: `chrome.storage.sync` + `chrome.tts`
- Web: `localStorage` + Web Speech API
- Mobile: `AsyncStorage` + `expo-speech`

Paylasilan `packages/core` saf TypeScript - sifir platform bagimliligi.

---

## Basari Metrikleri

| Metrik | Ay 3 Hedefi | Ay 6 Hedefi |
|--------|-------------|-------------|
| Chrome Web Store yukleme | 1,000 | 5,000 |
| Haftalik aktif kullanici | 400 (%40) | 2,000 (%40) |
| Premium kullanici | - | 50 ($300/ay) |
| Magaza puani | 4.5+ yildiz | 4.5+ yildiz |
| Landing page ziyareti | 3,000/ay | 10,000/ay |

---

## Dogrulama / Test Plani

### Gelistirme Sirasinda
- `pnpm dev:ext` ile WXT dev modunda canli gelistirme (HMR)
- Her ozellik icin 10+ populer sitede test (Wikipedia, Medium, Reddit, Google Docs, Twitter, YouTube, haber siteleri)
- TypeScript tip kontrolu: `pnpm typecheck`
- Birim testleri: `packages/core` icin vitest

### Lansman Oncesi
- Chrome Web Store inceleme gereksinimleri kontrolu
- Manifest V3 uyumluluk dogrulamasi
- Performans profilleme (content script yuklenme suresi < 50ms)
- Erisilebilirlik denetimi (popup icin klavye navigasyonu, ARIA)
- 20+ farkli sitede CSS catismasi testi
- TTS tum kenar durumlari (bos secim, cok uzun metin, ozel karakterler)

### Lansman Sonrasi
- Chrome Web Store analitigi izleme
- Kullanici geri bildirimi toplama (extension icinde geri bildirim formu)
- Haftalik hata izleme ve duzeltme dongusu

---

## Kritik Dosyalar

| Dosya | Onemi |
|-------|-------|
| `apps/extension/entrypoints/content.ts` | En kritik - CSS enjeksiyonu + TTS kelime vurgulama |
| `apps/extension/lib/tts-engine.ts` | En karmasik - metin parcalama, kuyruk, kelime siniri olaylari |
| `packages/core/src/settings/schema.ts` | Tum platformlarin bagli oldugu sozlesme |
| `apps/extension/entrypoints/popup/App.tsx` | Kullanicinin gordugu ana arayuz |
| `apps/extension/lib/css-injector.ts` | Her sitede calismasi gereken stil enjeksiyonu |

---

## Hemen Ilk Adim

Plani onayladiktan sonra:
1. Monorepo iskele olustur (pnpm + WXT + TypeScript)
2. OpenDyslexic font entegre et
3. Content script ile ilk CSS enjeksiyonunu calistir
4. Popup UI'da toggle + font slider'lar yap
5. -> Ilk gunde calisan bir prototip!

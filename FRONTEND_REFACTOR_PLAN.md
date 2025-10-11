## MedCom Frontend Refactor Planı (Modüler, Sürdürülebilir, Profesyonel)

Bu doküman, mevcut frontend (Vite + React) kod tabanını modüler, ölçeklenebilir ve sunucu tarafındaki yeni yapıyla uyumlu hale getirmek için adım adım refactor planıdır. Amaç mevcut davranışı koruyarak kod kalitesini, sürdürülebilirliği, performansı ve erişilebilirliği artırmaktır.

### Ana Hedefler
- API erişimini merkezi ve güvenilir hale getirmek (env tabanlı, hata yönetimli, prod’da sessiz loglama)
- Veri modellerini/normalizasyonu merkezileştirmek (özellikle `attributes` nesnesi)
- Sayfalar/komponentler/hook’lar arasında net sorumluluk ayrımı (UI vs. iş mantığı)
- Form doğrulama ve yükleme (upload) akışlarını standardize etmek
- Erişilebilirlik (a11y) ve performans iyileştirmeleri
- Test edilebilirlik (unit ve basit e2e) ve CI entegrasyonu
- Veri güvenliği: Üretim ve geliştirme verileri korunmalı; istemci tarafında gereksiz/destrüktif işlemler engellenmeli

---

### Envanter ve Tespitler (Özet)
- Router ve sayfalar:
  - `src/App.jsx` router ve ErrorBoundary içeriyor.
- API katmanı:
  - `src/config/api.js` baz URL belirleme ve axios interceptors; dev/prod davranışı var, yoğun loglama içeriyor.
- Ana sayfalar:
  - `CollectionGallery.jsx` `/api/cards` ile listeleme, filtreleme/sıralama ve grid/list görünümleri.
  - `CreateProposal.jsx` `/api/proposals` ile basitleştirilmiş başvuru formu (FormData, upload opsiyonel).
  - `AdminPanel.jsx` admin CRUD ve ayarlar (yerel sahte auth, localStorage anahtarı `adminAuthenticated`).
- Komponentler:
  - `Card`, `CardForm`, `ProposalItem`, `ConfirmationModal`, `Header`, `Footer`, `CardListItem`.
- Görsel yükleme:
  - `CardForm.jsx` içinde mobil odaklı upload retry ve sıkıştırma (`utils/imageCompression`).

Bazı mevcut noktalar (örnekler):
```50:74:/Users/yavuzselim/Desktop/MedCom/src/config/api.js
const responseInterceptor = (response) => {
  console.log('✅ API Response:', {
    url: response.config.url,
    method: response.config.method,
    status: response.status,
    statusText: response.statusText,
    data: response.data
  });
  return response;
};
...
const errorInterceptor = (error) => {
  console.error('❌ API Error:', {
    url: error.config?.url,
    method: error.config?.method,
    status: error.response?.status,
    statusText: error.response?.statusText,
    message: error.message,
    code: error.code,
    data: error.response?.data,
    timeout: error.code === 'ECONNABORTED'
  });
  return Promise.reject(error);
};
```
- Not: Prod’da bu seviyede log gürültüsü (özellikle response data) istemci konsolunda gereksiz.

```54:61:/Users/yavuzselim/Desktop/MedCom/src/pages/AdminPanel.jsx
// Simple authentication - in production, this would be server-side
if (loginData.username === 'admin' && loginData.password === 'admin123') {
  setIsAuthenticated(true);
  localStorage.setItem('adminAuthenticated', 'true');
  fetchData();
} else {
  setLoginError('Invalid username or password');
}
```
- Not: Yerel sahte auth sadece geçici kullanım için kabul edilebilir; orta vadede server tabanlı auth’a evrilmeli veya sayfa erişimi korumalı hale getirilmeli.

```20:56:/Users/yavuzselim/Desktop/MedCom/src/components/Card.jsx
// Cloudinary URL transformation enjection ve çeşitli image URL varyantları yönetiliyor
// Bu mantık ortak bir util’e veya `getImageUrl` türevi bir helper’a taşınabilir.
```

---

### Hedef Klasör Yapısı (Frontend)
```text
src/
  app/
    AppRouter.jsx          # sadece yönlendirme ve layout
    ErrorBoundary.jsx
    providers/
      QueryProvider.jsx    # (opsiyonel) React Query
      ThemeProvider.jsx    # (opsiyonel)
  api/
    client.ts|js           # axios instance (prod sessiz, dev detaylı log opsiyonu)
    endpoints.ts|js        # endpoint path sabitleri
    models.ts|js           # veri tipleri/şemalar (isteğe bağlı TS veya zod)
    adapters.ts|js         # normalize/denormalize (attributes vb.)
  hooks/
    useCards.ts|js
    useProposals.ts|js
    useAdmin.ts|js         # settings/cards/proposals yönetimi
  pages/
    Collection/
      CollectionPage.jsx
    Proposals/
      CreateProposalPage.jsx
    Admin/
      AdminPage.jsx
      CardsTab.jsx
      ProposalsTab.jsx
      SettingsTab.jsx
  components/
    cards/
      Card.jsx
      CardListItem.jsx
      CardDetailModal.jsx
      CardForm.jsx
    proposals/
      ProposalItem.jsx
    common/
      Header.jsx
      Footer.jsx
      ConfirmationModal.jsx
      EmptyState.jsx
      LoadingSpinner.jsx
  utils/
    images.ts|js           # getImageUrl, cloudinary transform helper
    format.ts|js           # tarih/sayı vb.
  styles/
    globals.css
    components/*.css       # (opsiyonel CSS Modules)
```

---

### Adım Adım Güvenli Refactor Planı
Her adım sonrası smoke test ve veri güvenliği kontrolü yapılacaktır. API sözleşmeleri değiştirilmeyecek; server planı ile uyum zorunludur.

1) API Katmanının Standardizasyonu
- Yapılacaklar:
  - `src/config/api.js` → `src/api/client.js` olarak taşınır.
  - Prod’da response body loglama kapatılır; hata logları minimal tutulur.
  - `endpoints.js` oluşturularak path sabitleri merkezileştirilir.
  - İsteğe bağlı: global error mapping (timeout, 4xx, 5xx) ve kullanıcıya uygun mesajlar.
- Kabul Kriterleri:
  - `/api/cards`, `/api/proposals`, `/api/admin/*` çağrıları mevcut şekilde çalışır.
  - Dev’de debug logları opsiyoneldir; prod’da konsol gürültüsü yoktur.
  - Veri Güvenliği: Hiçbir destructive endpoint istem dışı tetiklenmez.

2) Veri Modelleri ve Adaptörler
- Yapılacaklar:
  - `models.js` (veya TS kullanılacaksa `models.ts`) tanımla: Card, Proposal, AdminSettings.
  - `adapters.js`: API’den gelen veriyi normalize et (özellikle `attributes` her yerde nesne olarak garanti edilsin). Sunucu zaten `attributes`’u parse ediyor; yine de güvenli normalize katmanı eklensin.
- Kabul Kriterleri:
  - UI katmanı `attributes` için yalnızca nesne bekler.
  - Veri Güvenliği: Normalize yalnızca okuma işlemidir; veriyi değiştirmez.

3) Görsel URL/Transform Yardımcıları
- Yapılacaklar:
  - `utils/images.js`: Card/Proposal görselleri için tek bir `getImageUrl(imagePath, opts)` helper’ı.
  - Cloudinary transform ekleri (w_, c_limit, q_auto, f_auto) opsiyonel parametre olarak.
  - `Card.jsx` ve `ProposalItem.jsx` bu helper’ı kullanır.
- Kabul Kriterleri:
  - Mevcut görseller beklendiği gibi görünür; bozuk URL’lerde placeholder’a düşer.
  - Veri Güvenliği: Yalnızca UI; veri yazımı yoktur.

4) Hook’lara Ayrıştırma (Data Fetching/Mutaions)
- Yapılacaklar:
  - `useCards`, `useProposals`, `useAdmin` hook’ları: listeleme, approve/reject, create/update/delete ve settings CRUD tek noktadan.
  - (Opsiyonel) React Query entegrasyonu: önbellek, yükleme/yenileme durumları, invalidation.
- Kabul Kriterleri:
  - `AdminPanel`, `CollectionGallery`, `CreateProposal` sayfaları hook’lar üzerinden veri çeker.
  - Veri Güvenliği: Mutations yalnızca kullanıcı aksiyonları ile tetiklenir; tesadüfi çağrı yok.

5) Form Yönetimi ve Doğrulama
- Yapılacaklar:
  - `react-hook-form` + `@hookform/resolvers` + `zod` ile formlar standardize edilir.
  - `CardForm` ve `CreateProposal` zod şemaları: isim, açıklama zorunlu; sayısal alan sınırları; opsiyonel alanlar.
- Kabul Kriterleri:
  - Hatalı veri gönderimleri kullanıcıya anlaşılır mesajlarla döner; server doğrulamasıyla uyumlu.
  - Veri Güvenliği: FE doğrulama, yanlış veri yazımını engeller; var olan verileri etkilemez.

6) Admin Sayfası Modülerleştirme
- Yapılacaklar:
  - `AdminPanel.jsx` → `AdminPage.jsx` ve `CardsTab.jsx`, `ProposalsTab.jsx`, `SettingsTab.jsx` olarak bölünür.
  - Tabların her biri ilgili hook ve komponentleri kullanır.
  - Basit localStorage auth korunur; anahtar adı versiyonlu yapılabilir (örn. `medcom.admin.v1`).
- Kabul Kriterleri:
  - Tüm admin akışları (list, create/update/delete, approve/reject) çalışır.
  - Veri Güvenliği: destructive işlemler için confirm modal zorunlu; mevcut modal korunur.

7) Erişilebilirlik ve UX İyileştirmeleri
- Yapılacaklar:
  - Modal, buton ve formlarda rol/aria-etiketleri; klavye navigasyonu.
  - Loading ve empty state bileşenleri.
  - Hata ve başarı bildirimleri için non-blocking toast (ör. sonradan eklenebilir).
- Kabul Kriterleri:
  - Temel a11y denetiminden geçer; focus management modallarda çalışır.

8) Performans İyileştirmeleri
- Yapılacaklar:
  - `Card`, `ProposalItem` memoizasyonu; büyük listelerde virtualization (opsiyonel, veri boyutuna göre) — ör. `react-window`.
  - Görseller için `loading="lazy"`, `sizes/srcset` (opsiyonel).
- Kabul Kriterleri:
  - Liste sayfalarında render süreleri gözle görünür biçimde düşer.

9) Ortam Değişkenleri ve Dağıtım
- Yapılacaklar:
  - `VITE_API_URL` tek kaynaktan yönetilir; Netlify/Prod ile uyum.
  - Prod’da konsol logları minimize edilir; yalnızca hata logları korunur.
- Kabul Kriterleri:
  - Dev/Prod ortam geçişleri problemsizdir; baseURL doğru seçilir.

10) Test Stratejisi
- Yapılacaklar:
  - Unit: util ve adapters için basit testler.
  - Component: `Card`, `CardForm`, `ProposalItem` render ve basit etkileşim testleri (`@testing-library/react`).
  - (Opsiyonel) E2E: kritik akışlar için Cypress (listeleme, proposal gönderme, admin approve).
- Kabul Kriterleri:
  - Temel testler yeşil; CI pipeline’da çalıştırılabilir.

11) (Opsiyonel) TypeScript Geçişi
- Yapılacaklar:
  - Önce `api/`, `hooks/`, `utils/` dizinleri TS’e alınır.
  - `models.ts` ile tip güvenliği sağlanır; komponentler kademeli TS.
- Kabul Kriterleri:
  - Build hatasız; geliştirici deneyimi artar.

---

### Veri Korunumu ve Güvenliği (Frontend Perspektifi)
- İstemci tarafı refactor veritabanını değiştirmez; sunucu tarafı veri koruma planına bağlıdır.
- Destrüktif işlemler (delete/reject) UI’dan bilinçli tetiklenir ve `ConfirmationModal` zorunludur.
- Admin localStorage anahtarı mevcut davranışla uyumlu kalır; değişecekse geçici çift okuma:
  - Önce: `adminAuthenticated`
  - Sonra: `medcom.admin.v1` (değişim yapılırsa eski anahtar da okunup yeni yapıya taşınır).
- Upload akışlarında hata yönetimi (timeout/servis kesintisi) mevcut; kullanıcı dostu mesajlar korunur.

---

### Uyum Matrisi (Server ↔ Frontend)
- `/api/cards` (GET): Koleksiyon listesi; `attributes` nesne (server parse ediyor) → FE doğrudan kullanır.
- `/api/proposals` (GET/POST): Public list ve başvuru; `CreateProposalPage` FormData ile uyumlu.
- `/api/admin/cards` (GET/POST/PUT/DELETE): Admin yönetimi; `CardsTab` hook’lar üzerinden çağırır.
- `/api/admin/proposals` (GET/POST approve|reject/PUT/DELETE): Admin proposal akışları; `ProposalsTab` hook’lar üzerinden.
- `/api/admin/settings` (GET/PUT): Admin ayarları; `SettingsTab` ile uyumlu.

API yolları değişmeyecek; sadece frontend tarafında katmanlandırma ve standardizasyon yapılacaktır.

---

### Test ve Doğrulama Stratejisi
- Smoke Testler:
  - Koleksiyon listesi yükleniyor mu?
  - Proposal gönderilebiliyor mu (upload opsiyonel)?
  - Admin list/approve/reject/create/update/delete akışları çalışıyor mu?
  - Ayarlar okunup güncelleniyor mu?
- Görsel: Cloudinary ve local uploads URL’leri doğru çözümleniyor mu?
- Hata Durumları: Timeout, 4xx/5xx, ağ kopması — kullanıcı mesajları.

---

### Zamanlama Önerisi (Yaklaşık)
- Gün 1: API katmanı, endpoints, prod log sessizleştirme
- Gün 2: models/adapters ve utils/images; Card/ProposalItem güncellemeleri
- Gün 3: hooks/useCards-useProposals-useAdmin ve sayfaların entegrasyonu
- Gün 4: Admin modülerleştirme (tab’lar) ve formlar (react-hook-form + zod)
- Gün 5: a11y ve performans iyileştirmeleri; loading/empty states
- Gün 6: testler ve CI entegrasyonu
- Gün 7: (Opsiyonel) TypeScript çekirdeği (api/hooks/utils)

---

### Tamamlanma Tanımı (Definition of Done)
- Tüm kullanıcı akışları (public/admin) mevcut davranışı korur
- API çağrıları merkezi ve güvenilir; prod konsol log gürültüsü yok
- Komponentler ve sayfalar modüler; hook’lar üzerinden veri erişimi
- Formlar zod ile doğrulanır; hatalar kullanıcıya anlaşılır iletilir
- Erişilebilirlik ve performans iyileştirmeleri uygulanmıştır
- Temel testler yeşil; CI pipeline çalışır

### Checklist
- [ ] API katmanı `src/api/` altında ve prod loglar minimize
- [ ] `endpoints` ve `models/adapters` eklendi
- [ ] `utils/images` ile görsel URL standardizasyonu
- [ ] `useCards`, `useProposals`, `useAdmin` hook’ları
- [ ] `AdminPanel` modüler tab’lara ayrıldı
- [ ] `react-hook-form` + `zod` form doğrulaması
- [ ] a11y ve performans (memo/lazy/virtualization) iyileştirmeleri
- [ ] testler (utils + kritik komponentler)
- [ ] (Opsiyonel) TS geçişi çekirdek katmanlarda


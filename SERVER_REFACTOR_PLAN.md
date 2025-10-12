## MedCom Server Refactor Planı (Modüler, Sürdürülebilir, Profesyonel)

Bu doküman, `server/index.js` başta olmak üzere backend kod tabanını; modüler, okunabilir, test edilebilir ve profesyonel bir mimariye dönüştürmek için güvenli ve adım adım bir refactor planı sunar. Refactor süreci mevcut davranışı değiştirmeden yapılacak ve küçük, doğrulanabilir adımlar halinde ilerleyecektir.

### Ana Hedefler
- Kodun tek dosyada toplanmasını sonlandırmak; katmanlı ve anlamlı modüllere ayırmak
- Hata ve doğrulama yönetimini merkezileştirmek
- Dosya yükleme, e-posta ve harici servis bağımlılıklarını soyutlamak
- Tekrarlayan mantıkları util/service katmanlarına taşımak
- Loglama, konfigürasyon ve güvenlik ayarlarını standartlaştırmak
- Orta vadede veri modeli basitleştirmesi (Prisma `Json` alanına geçiş) için zemin hazırlamak
- Üretim ve geliştirme verilerinin tam korunumu ve geri alınabilirliği (backup/restore ile)

---

### Klasör Yapısı (Hedef)
Aşağıdaki yapı, sorumlulukları net ayırır ve büyümeye izin verir.

```text
server/
  app.js
  server.js
  config/
    env.js
    cors.js
    cloudinary.js
    multer.js
  lib/
    prisma.js
    logger.js
  middlewares/
    asyncHandler.js
    errorHandler.js
    validate.js
    upload.js
  routes/
    index.js
    health.routes.js
    debug.routes.js
    cards.routes.js
    proposals.routes.js
    admin/
      cards.routes.js
      proposals.routes.js
      settings.routes.js
  controllers/
    cards.controller.js
    proposals.controller.js
    admin/
      cards.controller.js
      proposals.controller.js
      settings.controller.js
    debug.controller.js
  services/
    email.service.js
    image.service.js
    cards.service.js
    proposals.service.js
    admin.service.js
  repositories/  (opsiyonel)
    cards.repository.js
    proposals.repository.js
    admin.repository.js
  validators/
    cards.schema.js
    proposals.schema.js
    admin.schema.js
  utils/
    parseAttributes.js
    formatYear.js
    responses.js
```

---

### Adım Adım Güvenli Refactor Planı
Her adım kendi başına deploy edilebilir olmalı. Her adım sonrası smoke test yapılmalı.

1) Uygulama Başlatma Katmanı
- Yapılacaklar:
  - `server/app.js` oluştur: Express app yarat, CORS ve `express.json()` uygula, router mount et, hata yakalama middleware’lerini ekle.
  - `server/server.js` oluştur: DB init ve `app.listen` burada.
  - `server/index.js` sadece giriş noktası olarak `require('./server')` çalıştırsın.
- Kabul Kriterleri:
  - Mevcut endpoint’ler aynı URL’lerde çalışır.
  - Sağlık kontrolü (`/api/health`) OK döner.
  - Veri Güvenliği: DB bağlantısı yalnızca okuma amaçlı doğrulanır, şema/tablolar üzerinde değişiklik yapılmaz.

2) Konfigürasyon ve ENV Doğrulama
- Yapılacaklar:
  - `config/env.js`: `process.env` doğrulaması (tercihen envalid veya zod ile). Gerekli alanlar prod’da zorunlu olsun (örn. Cloudinary, Resend).
  - `config/cors.js`: prod/dev ayrımı olan whitelist mantığı burada.
- Kabul Kriterleri:
  - Eksik kritik ENV’ler prod’da uygulamayı başlatmaz; dev’de uyarı loglanır.
  - Veri Güvenliği: ENV değişiklikleri veritabanı şemasına dokunmaz; yalnızca bağlantı/erişim katmanını etkiler.

3) Prisma ve Loglama Soyutlaması
- Yapılacaklar:
  - `lib/prisma.js`: tek PrismaClient instance ve bağlantı yönetimi burada.
  - `lib/logger.js`: pino veya winston ile standart logger.
- Kabul Kriterleri:
  - DB bağlantısı başarı/başarısızlık durumlarını anlamlı loglar.
  - Veri Güvenliği: Sadece bağlantı/doğrulama; migration/`db push` çalıştırılmaz.

4) Router Katmanı
- Yapılacaklar:
  - `routes/index.js`: `api` alt rotaları mount et.
  - `routes/health.routes.js`, `routes/debug.routes.js`: mevcut health/debug uçlarını taşı.
- Kabul Kriterleri:
  - Tüm rotalar aynı kalır, 404 ve hata yönetimi çalışır.
  - Veri Güvenliği: Yalnızca yönlendirme; veri yazma davranışı değiştirilmez.

5) Upload ve Cloudinary Konfigürasyonu
- Yapılacaklar:
  - `config/cloudinary.js`: Cloudinary init (prod’da zorunlu), dev’de no-op.
  - `config/multer.js`: storage ve limits; `middlewares/upload.js` ile `upload.single('image')` export et.
- Kabul Kriterleri:
  - `/api/test-upload` ve kart/proposal görsel yüklemeleri mevcut davranış ile çalışır.
  - Veri Güvenliği: Dosya yolları ve URL’ler değişse bile veritabanındaki referans alanları (image/url) tutarlılığı korunur.

6) Controller ve Service Katmanları (Cards/Proposals)
- Yapılacaklar:
  - `controllers/cards.controller.js`, `controllers/proposals.controller.js`
  - `services/cards.service.js`, `services/proposals.service.js`
  - Tekrarlayan JSON parse ve yıl formatlama `utils/` altına alınır.
- Kabul Kriterleri:
  - `/api/cards`, `/api/proposals` işlevleri değişmeden sürer.
  - Loglar ve hatalar merkezi yönetime geçer.
  - Veri Güvenliği: CRUD senaryolarında var olan kayıtlar etkilenmez; mevcut veriler doğru şekilde okunur ve döndürülür.

7) Admin Endpoints’in Ayrıştırılması
- Yapılacaklar:
  - `routes/admin/*.routes.js`, `controllers/admin/*.controller.js`, `services/admin.service.js`
  - Admin ayarları, proposal onay/red, kart CRUD mantıkları taşınır.
- Kabul Kriterleri:
  - Tüm admin uçları mevcut davranışı korur.
  - Veri Güvenliği: Onay/red/silme akışlarında üretim verisi üzerindeki değişiklikler yalnızca isteğe bağlı test ortamında denenir; prod deploy öncesi yedek alınır.

8) İstek Doğrulama ve Standart Yanıtlar
- Yapılacaklar:
  - `validators/*.schema.js` (zod/joi) ile body/params/query doğrulama.
  - `middlewares/validate.js` ile kontrol öncesi doğrulama.
  - `utils/responses.js` ile tutarlı yanıt yapısı (opsiyonel).
- Kabul Kriterleri:
  - Geçersiz istekler 400 ile anlamlı mesaj döner.
  - Veri Güvenliği: Doğrulama eklenmesi mevcut verileri değiştirmez; yalnızca yeni hatalı yazımları engeller.

9) Güvenlik ve Operasyonel İyileştirmeler
- Yapılacaklar:
  - `helmet`, sıkı `CORS`, rate limit (özellikle upload ve admin rotaları).
  - Prod’da `debug` rotalarını kapatmak veya korumak.
  - Swagger/OpenAPI dokümantasyonu eklemek (opsiyonel).
- Kabul Kriterleri:
  - Güvenlik uyarıları azalır, minimum false-positive.
  - Veri Güvenliği: Güvenlik eklemeleri veri şemasını etkilemez, yalnızca erişim/istek katmanına etki eder.

10) (Opsiyonel) Veri Modeli İyileştirmesi – Prisma `Json`
- Yapılacaklar:
  - `attributes` alanlarını `String` yerine `Json` yapısına geçirmek (migrasyon gerektirir).
  - Service ve controller’larda parse/stringify kaldırılır.
- Kabul Kriterleri:
  - Kart/proposal yanıtlarında `attributes` native JSON döner.
  - Veri Güvenliği: Migrasyon öncesi tam yedek alınır; staging üzerinde ileri-geri testleri yapılır; rollback komutu hazırdır.

---

### Veri Korunumu Stratejisi (Dev ve Prod)
Refactor sürecinin tüm aşamalarında mevcut veriler korunacaktır. Her adım öncesi yedek alınacak, adım sonrası doğrulama yapılacaktır.

- Kapsam
  - Dev: SQLite (varsayılan `prisma/dev.db` ve/veya `server/prisma/dev.db`)
  - Prod: Railway/Postgres (veya tanımlı prod veritabanı)

- Ön Koşullar
  - `.env` ve deployment ortam değişkenleri güncel ve senkron.
  - CLI ve server aynı `DATABASE_URL`’ü kullanıyor (proje kök `.env` yüklenir).

- Yedekleme (Backup)
  - Dev (SQLite):
    - Dosya seviyesinde güvenli kopya alın.
    - Örnek:
      ```bash
      # SQLite dosya yedeği
      cp prisma/dev.db prisma/dev.db.bak.$(date +%Y%m%d%H%M%S)
      ```
  - Prod (Postgres/Railway):
    - `RAILWAY_DEPLOYMENT_MIGRATION.md`, `PRODUCTION_MIGRATION_GUIDE.md` ve `SAFE_DATABASE_MIGRATION.md` yönergelerine uygun `pg_dump` ile yedek alın.
    - Örnek:
      ```bash
      # Postgres dökümü (DATABASE_URL ortamda tanımlı olmalı)
      pg_dump "$DATABASE_URL" --no-owner --format=custom \
        --file=backup_$(date +%Y%m%d%H%M%S).dump
      ```

- Geri Yükleme (Restore)
  - Dev (SQLite):
    ```bash
    # Geri yükleme
    cp prisma/dev.db.bak.YEDEK_ZAMAN_DAMGASI prisma/dev.db
    ```
  - Prod (Postgres/Railway):
    ```bash
    # Postgres geri yükleme örneği
    pg_restore --clean --no-owner --dbname="$DATABASE_URL" backup_YYYYmmddHHMMSS.dump
    ```

- Kabul Kriterleri (Her Adım İçin)
  - [ ] Adım öncesi yedek başarıyla alındı ve doğrulandı.
  - [ ] Adım sonrası kritik tabloların satır sayıları ve örnek kayıtları karşılaştırıldı.
  - [ ] CRUD operasyonları örnek veriyle test edildi (okuma/yazma/silme).
  - [ ] Fail durumda yedekten geri dönüldüğünde uygulama beklenen şekilde çalışıyor.

- Notlar
  - Şema değişikliği yapılmayan bu refactor kapsamı verileri doğal olarak etkilenmez; buna rağmen operasyonel güvenlik için yedek/geri dönüş uygulanır.
  - Gelecekteki Prisma `Json` migrasyonu gibi şemayı etkileyen işlerde bu prosedür zorunludur ve ek doğrulama adımları ile güçlendirilmelidir.

---

### Kod Standartları ve Paylaşılan Yardımcılar

- Async Hata Sarmalayıcı
```js
// middlewares/asyncHandler.js
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

- Merkezi Hata Yöneticisi
```js
// middlewares/errorHandler.js
module.exports = (err, req, res, next) => {
  if (err.type === 'validation') return res.status(400).json({ error: err.message });
  if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
  const status = err.status || 500;
  return res.status(status).json({ error: err.message || 'Server error' });
};
```

- Zod ile Doğrulama
```js
// middlewares/validate.js
module.exports = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) return next({ type: 'validation', message: result.error.message });
  next();
};
```

- Tekrarlayan Mantıklar
```js
// utils/formatYear.js
exports.formatYear = (yearString) => {
  if (!yearString || String(yearString).trim() === '') return null;
  const year = parseInt(yearString, 10);
  if (Number.isNaN(year) || year < 1 || year > 2100) return null;
  return year;
};

// utils/parseAttributes.js
exports.parseAttributes = (value) => {
  if (value == null) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch (_) { return {}; }
};
```

- Görsel URL Soyutlaması
```js
// services/image.service.js
exports.getImageUrl = (file, { baseUrl, port, isCloudinary }) => {
  if (!file) return null;
  if (file.path) return file.path; // Cloudinary URL
  if (file.buffer) {
    const base64 = file.buffer.toString('base64');
    return `data:${file.mimetype};base64,${base64}`;
  }
  if (file.filename) return `${baseUrl || 'http://localhost'}:${port}/uploads/${file.filename}`;
  return null;
};
```

- Örnek Router ve Controller Ayrımı
```js
// routes/admin/cards.routes.js
const router = require('express').Router();
const ctrl = require('../../controllers/admin/cards.controller');
const asyncHandler = require('../../middlewares/asyncHandler');
const upload = require('../../middlewares/upload');

router.post('/', upload.single('image'), asyncHandler(ctrl.create));
router.put('/:id', upload.single('image'), asyncHandler(ctrl.update));
router.delete('/:id', asyncHandler(ctrl.remove));
module.exports = router;
```

```js
// controllers/admin/cards.controller.js
const service = require('../../services/cards.service');
exports.create = async (req, res) => {
  const result = await service.create({ body: req.body, file: req.file });
  res.status(201).json(result);
};
```

---

### Test ve Doğrulama Stratejisi
- Smoke Test: Her adım sonrası en kritik uçlar (`/api/health`, `/api/cards`, upload testleri) manuel doğrulanır.
- Entegrasyon Testleri (opsiyonel): `supertest` ile ana rotalar için happy-path.
- Log İnceleme: Başlatma, DB bağlantısı ve hata durumları temiz ve anlaşılır mı?

Komut Örnekleri:
```bash
# Local server
npm run start
# veya
npm run server
```

---

### Güvenlik ve Operasyonel İyileştirmeler
- `helmet`, `rate-limiter-flexible` veya `express-rate-limit` ekleyin
- CORS whitelist’i prod’da zorunlu hale getirin
- Debug endpointleri prod’da kapatın veya korumalı yapın
- Logger’ı prod/dev seviyelerine göre yapılandırın

---

### Riskler ve Geri Dönüş Planı
- Router/Controller ayrışmasında yolu yanlış mount etme → Her adım sonrası smoke test.
- Upload/storage davranış değişikliği → `test-upload` ile doğrulama.
- ENV doğrulama prod’u kilitleme riski → Dev’de uyarı, prod’da zorunluluk.
- Prisma `Json` geçişi schema migration gerektirir → Ayrı bir sprintte, yedekli ve tek tuş rollback planıyla yapılmalı.

Rollback İlkesi: Her adım PR bazlı; sorun halinde önceki sürüme dönülebilir.

---

### Zamanlama Önerisi (Yaklaşık)
- Gün 1: app/server katmanı, config/env, cors
- Gün 2: cloudinary/multer/upload ayrıştırması
- Gün 3: cards/proposals controller+service
- Gün 4: admin rotaları ve controller/service
- Gün 5: doğrulama, error handler, logging standardizasyonu
- Gün 6: güvenlik ve dokümantasyon (Swagger)
- Gün 7: opsiyonel Prisma `Json` migration hazırlığı

---

### Tamamlanma Tanımı (Definition of Done)
- Tüm endpointler mevcut davranışı koruyor
- Kod yapısı hedef klasör mimarisine uygun
- Hata ve doğrulama merkezi yönetiliyor
- Loglar temiz ve aksiyon alınabilir
- Temel smoke testler yeşil

### Checklist
- [ ] `app.js` ve `server.js` oluşturuldu, `index.js` yalnızca giriş
- [ ] `config/env.js` ve `config/cors.js` eklendi
- [ ] `lib/prisma.js` ve `lib/logger.js` hazır
- [ ] `routes/index.js`, `health` ve `debug` rotaları taşındı
- [ ] `config/cloudinary.js`, `config/multer.js`, `middlewares/upload.js` eklendi
- [ ] `controllers` ve `services` (cards/proposals) ayrıldı
- [ ] `routes/admin/*` + `controllers/admin/*` tamam
- [ ] `validators/*` ve `validate` middleware aktif
- [ ] `errorHandler` merkezi kullanımda
- [ ] Güvenlik (helmet, rate limit) uygulandı
- [ ] (Opsiyonel) `attributes` alanları Prisma `Json` oldu

---

Sorular veya uyarlama ihtiyaçları için bu plan üzerinden ilerleyelim; her adımı küçük PR’lara bölerek güvenle taşıyacağız.

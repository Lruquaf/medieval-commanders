# Complete Production Migration Guide

## Önemli Değişiklikler

Haklısın! Lokalde yapılan değişiklikler şunlar:

### 1. **Tarih Alanları Değişikliği** (Çok Önemli!)
- `birthDate` (DateTime) → `birthYear` (Int)
- `deathDate` (DateTime) → `deathYear` (Int)
- **Veri dönüşümü gerekiyor**: Mevcut tarihlerden yıl çıkarılacak

### 2. **Admin Sosyal Medya Alanları**
- `instagramUrl`, `twitterUrl`, `facebookUrl`, `linkedinUrl`, `youtubeUrl` eklendi

## Migration Karmaşıklığı

Bu migration **karmaşık** çünkü:
- ✅ **Veri tipi değişiyor**: DateTime → Int
- ✅ **Alan adı değişiyor**: birthDate → birthYear
- ✅ **Veri dönüşümü**: Tarihlerden yıl çıkarma
- ✅ **Geriye dönük uyumluluk**: Mevcut veriler korunacak

## Güvenli Migration Yöntemleri

### Yöntem 1: Otomatik Script (Önerilen)
```bash
./migrate-production-complete.sh
```

Bu script:
- Mevcut veritabanı yapısını kontrol eder
- Güvenli veri dönüşümü yapar
- Tüm değişiklikleri uygular
- Veri kaybını önler

### Yöntem 2: Manuel Adımlar

#### Adım 1: Mevcut Yapıyı Kontrol Et
```sql
-- Railway veritabanında çalıştır
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('cards', 'proposals', 'admins')
AND column_name IN ('birthDate', 'birthYear', 'deathDate', 'deathYear', 'instagramUrl');
```

#### Adım 2: Güvenli Migration
```sql
-- 1. Yeni alanları ekle
ALTER TABLE "cards" ADD COLUMN "birthYear" INTEGER;
ALTER TABLE "cards" ADD COLUMN "deathYear" INTEGER;
ALTER TABLE "proposals" ADD COLUMN "birthYear" INTEGER;
ALTER TABLE "proposals" ADD COLUMN "deathYear" INTEGER;

-- 2. Mevcut verileri dönüştür
UPDATE "cards" SET "birthYear" = EXTRACT(YEAR FROM "birthDate")::INTEGER WHERE "birthDate" IS NOT NULL;
UPDATE "cards" SET "deathYear" = EXTRACT(YEAR FROM "deathDate")::INTEGER WHERE "deathDate" IS NOT NULL;
UPDATE "proposals" SET "birthYear" = EXTRACT(YEAR FROM "birthDate")::INTEGER WHERE "birthDate" IS NOT NULL;
UPDATE "proposals" SET "deathYear" = EXTRACT(YEAR FROM "deathDate")::INTEGER WHERE "deathDate" IS NOT NULL;

-- 3. Sosyal medya alanlarını ekle
ALTER TABLE "admins" ADD COLUMN "instagramUrl" TEXT;
ALTER TABLE "admins" ADD COLUMN "twitterUrl" TEXT;
ALTER TABLE "admins" ADD COLUMN "facebookUrl" TEXT;
ALTER TABLE "admins" ADD COLUMN "linkedinUrl" TEXT;
ALTER TABLE "admins" ADD COLUMN "youtubeUrl" TEXT;

-- 4. Eski alanları sil (isteğe bağlı)
-- ALTER TABLE "cards" DROP COLUMN "birthDate";
-- ALTER TABLE "cards" DROP COLUMN "deathDate";
-- ALTER TABLE "proposals" DROP COLUMN "birthDate";
-- ALTER TABLE "proposals" DROP COLUMN "deathDate";
```

## Güvenlik Önlemleri

### ✅ **Veri Güvenliği**
- Mevcut veriler korunur
- Veri dönüşümü güvenli
- Geri alma seçeneği var

### ✅ **Test Önerileri**
1. **Önce test veritabanında dene**
2. **Veri yedekle** (Railway otomatik yedekler)
3. **Migration'ı küçük adımlarda yap**

### ✅ **Rollback Planı**
```sql
-- Eğer sorun olursa geri al
ALTER TABLE "cards" DROP COLUMN IF EXISTS "birthYear";
ALTER TABLE "cards" DROP COLUMN IF EXISTS "deathYear";
ALTER TABLE "proposals" DROP COLUMN IF EXISTS "birthYear";
ALTER TABLE "proposals" DROP COLUMN IF EXISTS "deathYear";
ALTER TABLE "admins" DROP COLUMN IF EXISTS "instagramUrl";
ALTER TABLE "admins" DROP COLUMN IF EXISTS "twitterUrl";
ALTER TABLE "admins" DROP COLUMN IF EXISTS "facebookUrl";
ALTER TABLE "admins" DROP COLUMN IF EXISTS "linkedinUrl";
ALTER TABLE "admins" DROP COLUMN IF EXISTS "youtubeUrl";
```

## Beklenen Sonuçlar

### Migration Sonrası:
- ✅ `birthYear` ve `deathYear` alanları (Int)
- ✅ Mevcut tarih verileri yıla dönüştürülmüş
- ✅ Sosyal medya alanları eklendi
- ✅ Tüm mevcut veriler korundu

### Test Edilecekler:
1. Admin panelinde sosyal medya ayarları
2. Kartlarda yıl bilgilerinin görünmesi
3. Proposal'larda yıl bilgilerinin görünmesi
4. Footer'da sosyal medya linkleri

## Önemli Notlar

- **Veri Kaybı Riski**: Çok düşük (sadece ekleme ve dönüşüm)
- **Downtime**: Minimal (sadece migration süresi)
- **Geriye Uyumluluk**: Mevcut kod çalışmaya devam eder
- **Performance**: Negatif etki yok

---

**Bu migration karmaşık ama güvenli. Tüm mevcut verileriniz korunacak!**

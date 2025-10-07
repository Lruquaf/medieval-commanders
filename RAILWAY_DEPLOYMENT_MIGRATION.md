# Railway Deployment ile Migration Rehberi

## 🚀 **Otomatik Migration Yöntemi**

Bu yöntemle migration otomatik olarak deployment sırasında çalışacak ve sadece bir kez uygulanacak.

## **Adım 1: Kodu Hazırla ve Pushla**

```bash
# Değişiklikleri commit et
git add .
git commit -m "feat: Add migration to deployment script for birthYear/deathYear and social media fields"
git push origin main
```

## **Adım 2: Railway Deployment'ı İzle**

1. Railway dashboard'a git: https://railway.app/dashboard
2. Projeni seç
3. Backend servisini seç
4. "Deployments" tab'ına git
5. Yeni deployment'ın başlamasını bekle
6. "Logs" tab'ına git ve migration'ı izle

## **Adım 3: Migration Loglarını Kontrol Et**

Loglarda şunları göreceksin:

```
🔧 Starting database migration process...
🚀 Running one-time database migration...
✓ Database connection successful
Executing migration with psql...
✅ Migration completed successfully!
```

## **Adım 4: Migration Sonrası Kontrol**

### **Backend Test:**
```bash
# Health check
curl https://your-backend.railway.app/api/health

# Admin settings (yeni alanları döndürmeli)
curl https://your-backend.railway.app/api/admin/settings

# Cards endpoint (birthYear/deathYear döndürmeli)
curl https://your-backend.railway.app/api/cards
```

### **Frontend Test:**
1. Admin paneline git
2. Settings tab'ında sosyal medya alanlarını gör
3. Ana sayfada footer'da sosyal medya linklerini kontrol et

## **Adım 5: Normal Deployment'a Geç**

Migration başarılı olduktan sonra:

```bash
# Normal deployment script'ine geri dön
Artık gerek yok; `railway.json` tek bir start komutuna işaret ediyor.

# Değişikliği pushla
git add railway.json
git commit -m "Switch back to normal deployment after migration"
git push origin main
```

## **🔧 Migration Ne Yapıyor?**

### **1. Veritabanı Alanları:**
- `cards` tablosuna `birthYear`, `deathYear` ekler
- `proposals` tablosuna `birthYear`, `deathYear` ekler
- `admins` tablosuna sosyal medya alanları ekler

### **2. Veri Dönüşümü:**
- Mevcut `birthDate` → `birthYear` (tarihten yıl çıkarır)
- Mevcut `deathDate` → `deathYear` (tarihten yıl çıkarır)

### **3. Güvenlik:**
- Sadece bir kez çalışır (flag file ile kontrol)
- Mevcut verileri korur
- Hata durumunda deployment devam eder

## **🛡️ Güvenlik Önlemleri**

### **✅ Veri Güvenliği:**
- Mevcut veriler korunur
- Sadece yeni alanlar eklenir
- Veri dönüşümü güvenli

### **✅ Tek Seferlik Çalışma:**
- Migration flag file ile kontrol edilir
- Tekrar çalışmaz
- Performance etkisi yok

### **✅ Hata Yönetimi:**
- Migration başarısız olsa bile deployment devam eder
- Detaylı log mesajları
- Rollback seçeneği

## **📊 Beklenen Sonuçlar**

### **Migration Sonrası:**
- ✅ `birthYear`, `deathYear` alanları eklendi
- ✅ Sosyal medya alanları eklendi
- ✅ Mevcut veriler dönüştürüldü
- ✅ Tüm mevcut veriler korundu

### **Test Edilecekler:**
1. Admin panelde sosyal medya ayarları
2. Kartlarda yıl bilgilerinin görünmesi
3. Footer'da sosyal medya linkleri
4. Responsive tasarım

## **🚨 Sorun Giderme**

### **Migration Başarısız Olursa:**
1. Logları kontrol et
2. Veritabanı bağlantısını kontrol et
3. Manuel migration yap (Railway shell ile)

### **"Migration already completed" Mesajı:**
- Normal, migration zaten çalışmış
- Deployment devam edecek

### **Database Connection Failed:**
- Railway PostgreSQL servisini kontrol et
- DATABASE_URL environment variable'ını kontrol et

## **📝 Önemli Notlar**

- **Migration sadece bir kez çalışır**
- **Mevcut veriler korunur**
- **Performance etkisi minimal**
- **Rollback mümkün**

---

**Bu yöntem en güvenli ve otomatik migration yöntemidir!**

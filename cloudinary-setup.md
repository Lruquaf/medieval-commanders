# Cloudinary Setup Instructions

## 1. Cloudinary Hesabı Oluşturma

1. https://cloudinary.com adresine gidin
2. "Sign Up For Free" butonuna tıklayın
3. Hesap oluşturun (ücretsiz)

## 2. API Bilgilerini Alma

1. Cloudinary Dashboard'a gidin
2. "Dashboard" sekmesine tıklayın
3. Aşağıdaki bilgileri kopyalayın:
   - Cloud Name
   - API Key
   - API Secret

## 3. Railway'de Environment Variables Ekleme

1. Railway Dashboard'a gidin
2. Backend servisinize gidin
3. "Variables" sekmesine tıklayın
4. Aşağıdaki variables'ları ekleyin:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 4. Test Etme

Environment variables eklendikten sonra:
1. Backend servisini yeniden deploy edin
2. Yeni proposal oluşturun (görsel ile)
3. Görselin Cloudinary'de yüklendiğini kontrol edin
4. Frontend'te görselin göründüğünü kontrol edin

## Avantajlar

- ✅ Kalıcı görsel storage
- ✅ Otomatik görsel optimizasyonu
- ✅ CDN desteği (hızlı yükleme)
- ✅ Responsive görsel dönüşümleri
- ✅ Güvenilir ve ölçeklenebilir

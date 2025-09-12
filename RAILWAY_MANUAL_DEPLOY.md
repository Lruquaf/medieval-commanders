# Railway Manuel Deploy Adımları

## 1. Railway'de Yeni Proje Oluştur

1. [railway.app](https://railway.app) → Login
2. "New Project" → "Deploy from GitHub repo"
3. Bu repository'yi seç

## 2. PostgreSQL Veritabanı Ekle

1. Proje dashboard'da "New" butonuna tıkla
2. "Database" → "PostgreSQL" seç
3. Veritabanı otomatik oluşturulacak

## 3. Backend Servisi Oluştur

1. "New Service" → "GitHub Repo"
2. Aynı repository'yi seç
3. Root directory boş bırak

## 4. Environment Variables Ekle

Backend servisi için:

```
NODE_ENV=production
FRONTEND_URL=https://medieval-commnaders.netlify.app
```

## 5. Deploy

Railway otomatik deploy edecek. Logları takip et.

## 6. Netlify'da Frontend URL'i Güncelle

1. Netlify dashboard → Site settings → Environment variables
2. `VITE_API_URL` = Railway backend URL'iniz

## 7. Test Et

- Netlify frontend'i aç
- Admin panel'e git
- Create Card butonunu test et

## Beklenen Sonuç

- ✅ CORS hataları gitmeli
- ✅ Create Card çalışmalı
- ✅ Delete işlemleri çalışmalı
- ✅ Timeout hataları gitmeli

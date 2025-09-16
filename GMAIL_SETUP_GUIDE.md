# Gmail App Password Setup Guide

Bu rehber, Gmail ile gerçek email göndermek için app password nasıl oluşturulacağını açıklar.

## 🔐 Gmail App Password Oluşturma

### 1. Google Hesabınızda 2-Factor Authentication'ı Aktifleştirin

1. [Google Account](https://myaccount.google.com/) sayfasına gidin
2. **Security** sekmesine tıklayın
3. **2-Step Verification** bölümünü bulun
4. **Get started** butonuna tıklayın
5. Telefon numaranızı doğrulayın

### 2. App Password Oluşturun

1. **Security** sekmesinde **2-Step Verification** altında
2. **App passwords** seçeneğini bulun
3. **Select app** dropdown'ından **Mail** seçin
4. **Select device** dropdown'ından **Other (Custom name)** seçin
5. "Medieval Commanders App" yazın
6. **Generate** butonuna tıklayın
7. **16 karakterlik app password'ü kopyalayın** (örnek: `abcd efgh ijkl mnop`)

### 3. Environment Variables'ı Güncelleyin

`.env.local` dosyanızı oluşturun veya güncelleyin:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration - Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Email sender information
EMAIL_FROM="Medieval Commanders <noreply@medievalcommanders.com>"

# Default admin email
DEFAULT_ADMIN_EMAIL="admin@medievalcommanders.com"
```

### 4. Server'ı Yeniden Başlatın

```bash
cd server
node index-local.js
```

## ⚠️ Önemli Notlar

- **App password'ü güvenli tutun** - normal şifreniz değil
- **App password'ü version control'e eklemeyin** - `.env.local` dosyasını `.gitignore`'a ekleyin
- **App password 16 karakter** - boşluklar olmadan yazın
- **2FA aktif olmalı** - app password oluşturmak için gerekli

## 🧪 Test Etme

1. Server'ı Gmail ile başlatın
2. Admin panelinde email adresinizi güncelleyin
3. Yeni bir proposal oluşturun
4. Email'in gerçekten geldiğini kontrol edin

## 🔧 Sorun Giderme

### "Invalid login" hatası
- App password'ün doğru olduğundan emin olun
- 2FA'nın aktif olduğunu kontrol edin
- Email adresinin doğru olduğundan emin olun

### "Less secure app access" hatası
- Gmail'de "Less secure app access" kapatılmış olmalı
- App password kullanın, normal şifre değil

### Email gelmiyor
- Spam klasörünü kontrol edin
- Email adresinin doğru olduğundan emin olun
- Console'da hata mesajlarını kontrol edin

# Gmail App Password Kurulum Rehberi

## Sorun
Email gönderirken "Email send timeout" hatası alıyorsunuz. Bu genellikle Gmail authentication sorunlarından kaynaklanır.

## Çözüm Adımları

### 1. Gmail'de 2-Factor Authentication'ı Aktifleştirin

1. Gmail hesabınıza giriş yapın
2. [Google Account Security](https://myaccount.google.com/security) sayfasına gidin
3. "2-Step Verification" bölümünü bulun
4. "Get started" butonuna tıklayın
5. Telefon numaranızı doğrulayın
6. 2FA'yı aktifleştirin

### 2. App Password Oluşturun

1. 2FA aktifleştirildikten sonra, aynı Security sayfasında "App passwords" bölümünü bulun
2. "App passwords" linkine tıklayın
3. "Select app" dropdown'ından "Mail" seçin
4. "Select device" dropdown'ından "Other (Custom name)" seçin
5. "Medieval Commanders App" gibi bir isim verin
6. "Generate" butonuna tıklayın
7. **16 karakterlik app password'ü kopyalayın** (örnek: `abcd efgh ijkl mnop`)

### 3. Environment Variables'ı Güncelleyin

`server/.env` dosyanızı oluşturun veya güncelleyin:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=yavuzselimtuncer02@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop

# Email sender information
EMAIL_FROM="Medieval Commanders <noreply@medievalcommanders.com>"

# Default admin email
DEFAULT_ADMIN_EMAIL="admin@medievalcommanders.com"
```

**ÖNEMLİ:** 
- `EMAIL_PASS` değeri normal Gmail şifreniz DEĞİL, app password olmalıdır
- App password'de boşluklar varsa kaldırın: `abcdefghijklmnop`

### 4. Server'ı Yeniden Başlatın

```bash
cd server
npm start
```

### 5. Test Edin

Proposal oluşturmayı deneyin. Artık email timeout hatası almamalısınız.

## Hata Ayıklama

Eğer hala sorun yaşıyorsanız:

1. **Console loglarını kontrol edin**: Server loglarında email configuration bilgilerini göreceksiniz
2. **App password'ü doğrulayın**: 16 karakter olmalı, boşluk içermemeli
3. **2FA aktif mi kontrol edin**: App password sadece 2FA aktifken çalışır
4. **Gmail hesabı güvenli mi**: "Less secure app access" kapalı olmalı

## Alternatif Çözümler

Eğer Gmail çalışmazsa:

### Mailtrap (Test için)
```env
EMAIL_SERVICE=mailtrap
MAILTRAP_USER=your-username
MAILTRAP_PASS=your-password
```

### Ethereal Email (Test için)
```env
EMAIL_SERVICE=ethereal
# Bu durumda gerçek email gönderilmez, sadece preview URL oluşturulur
```

## Production için Öneriler

Production ortamında Gmail yerine şunları kullanın:
- SendGrid
- AWS SES
- Mailgun
- Postmark

Bu servisler daha güvenilir ve yüksek volume email gönderimi için optimize edilmiştir.

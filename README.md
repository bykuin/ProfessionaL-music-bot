# 🎵 Discord Müzik Bot

Profesyonel Discord müzik botu - YouTube'dan müzik çalabilen, tam özellikli bot!

## ✨ Özellikler

- 🎵 **YouTube Müzik Çalma** - Herhangi bir müzik adı yazarak YouTube'dan çal
- 📋 **Kuyruk Yönetimi** - Müzikleri sıraya al ve yönet
- ⏸️ **Oynatıcı Kontrolleri** - Duraklat, devam et, atla, durdur
- 🔊 **Ses Kontrolleri** - Ses seviyesini 0-100 arasında ayarla
- 📊 **Bilgi Gösterimi** - Şu anda çalan müzik ve kuyruk bilgisi
- 🎯 **Kolay Kullanım** - Basit komutlar, güzel arayüz
- 🌐 **7/24 Hosting** - Ücretsiz hosting seçenekleriyle 24 saat çalış

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 16+
- Discord Bot Token
- FFmpeg

### Kurulum
```bash
# Paketleri kur
npm install

# .env dosyasını oluştur ve token'ı ekle
# DISCORD_TOKEN=your_token_here

# Botu çalıştır
npm start
```

Detaylı kurulum için [KURULUM.md](./KURULUM.md) dosyasını oku.

## 📖 Komutlar

| Komut | Açıklama |
|-------|----------|
| `!play [müzik]` | YouTube'dan müzik çalar |
| `!stop` | Müzik durdurur |
| `!pause` | Müzik duraklatır |
| `!resume` | Müzik devam eder |
| `!skip` | Sonraki müziğe geçer |
| `!queue` | Sıradaki müzikleri gösterir |
| `!now` | Şu anda çalan müziği gösterir |
| `!volume [0-100]` | Ses seviyesini ayarlar |
| `!help` | Komutları gösterir |

## 📁 Proje Yapısı

```
discord-music-bot/
├── bot.js              # Ana bot dosyası
├── package.json        # Paket bilgileri
├── .env                # Konfigürasyon (token)
├── KURULUM.md          # Detaylı kurulum rehberi
└── README.md           # Bu dosya
```

## 🔧 Teknik Detaylar

- **Framework:** Discord.js 14
- **Ses İşleme:** @discordjs/voice
- **Müzik Kaynağı:** play-dl (YouTube)
- **Ortam:** Node.js

## 🌐 Hosting Seçenekleri

### Ücretsiz Hosting
1. **Render** - Tavsiye edilen, en stabil
2. **Railway** - Hızlı deployment
3. **Replit** - Basit ve hızlı

Detaylı talimatlar için [KURULUM.md](./KURULUM.md) dosyasını oku.

## 📝 Notlar

- Bot yetkilerini doğru ayarla
- FFmpeg'i kur
- Token'ı güvenli tut
- Hosting için environment variables'ı ayarla

## 🤝 Katkıda Bulun

Geliştirmeler ve öneriler için pull request gönder!

## 📄 Lisans

MIT License

---

**Müzik botunu kurulum rehberi ile başlat! 🎉**

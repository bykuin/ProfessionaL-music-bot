// Discord Bot Konfigürasyonu
// Bu dosyayı config.js olarak kopyala ve değerleri doldur

module.exports = {
  // Discord Bot Token
  // Discord Developer Portal'dan al: https://discord.com/developers/applications
  DISCORD_TOKEN: 'YOUR_BOT_TOKEN_HERE',

  // Bot Komutu Öneki
  PREFIX: '!',

  // Ses Ayarları
  VOICE_CONFIG: {
    defaultVolume: 0.5, // 0-1 arasında (0.5 = %50)
    maxQueueSize: 100,  // Maksimum kuyruk boyutu
  },

  // Müzik Kaynakları
  MUSIC_SOURCES: {
    youtube: true,      // YouTube desteği
  },

  // Embed Renkleri
  COLORS: {
    playing: '#FF0000',   // Kırmızı - Şu anda çalıyor
    queue: '#00FF00',     // Yeşil - Kuyrukta eklendi
    info: '#0099FF',      // Mavi - Bilgi
    help: '#00FF00',      // Yeşil - Yardım
    error: '#FF0000',     // Kırmızı - Hata
  },
};

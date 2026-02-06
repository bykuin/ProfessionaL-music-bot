const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const play = require('play-dl');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Müzik kuyruk sistemi
const musicQueues = new Map();
const PREFIX = process.env.PREFIX || '!';

// Sunucu başına kuyruk bilgisi
function getQueue(guildId) {
  if (!musicQueues.has(guildId)) {
    musicQueues.set(guildId, {
      songs: [],
      isPlaying: false,
      volume: 0.5,
      player: null,
      connection: null,
      currentSong: null,
    });
  }
  return musicQueues.get(guildId);
}

// Müzik arama fonksiyonu
async function searchMusic(query) {
  try {
    // Önce YouTube'da ara
    const results = await play.search(query, { limit: 1 });
    if (results && results.length > 0) {
      return results[0];
    }
    return null;
  } catch (error) {
    console.error('Müzik arama hatası:', error);
    return null;
  }
}

// Müzik çalma fonksiyonu
async function playSong(interaction, song) {
  const queue = getQueue(interaction.guildId);
  
  try {
    // Ses akışını al
    const stream = await play.stream(song.url);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true,
    });

    // Ses seviyesini ayarla
    resource.volume.setVolume(queue.volume);

    // Oynatıcıyı oluştur veya güncelle
    if (!queue.player) {
      queue.player = createAudioPlayer();
      queue.connection.subscribe(queue.player);
    }

    queue.player.play(resource);
    queue.currentSong = song;
    queue.isPlaying = true;

    // Oynatıcı olaylarını dinle
    queue.player.on(AudioPlayerStatus.Idle, async () => {
      queue.songs.shift();
      if (queue.songs.length > 0) {
        await playSong(interaction, queue.songs[0]);
      } else {
        queue.isPlaying = false;
        queue.currentSong = null;
      }
    });

    queue.player.on('error', error => {
      console.error('Oynatıcı hatası:', error);
      queue.songs.shift();
      if (queue.songs.length > 0) {
        playSong(interaction, queue.songs[0]);
      }
    });

  } catch (error) {
    console.error('Müzik çalma hatası:', error);
    throw error;
  }
}

// Bot hazır olduğunda
client.on('ready', () => {
  console.log(`✅ Bot giriş yaptı: ${client.user.tag}`);
  client.user.setActivity('!play [müzik adı]', { type: 'LISTENING' });
});

// Mesaj komutları
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    // !play komutu
    if (command === 'play') {
      if (!message.member.voice.channel) {
        return message.reply('❌ Ses kanalına bağlı olmalısın!');
      }

      const query = args.join(' ');
      if (!query) {
        return message.reply('❌ Müzik adı yazmalısın! Örnek: `!play Despacito`');
      }

      await message.reply('🔍 Müzik aranıyor...');

      const song = await searchMusic(query);
      if (!song) {
        return message.reply('❌ Müzik bulunamadı!');
      }

      const queue = getQueue(message.guildId);

      // Eğer bağlı değilse bağlan
      if (!queue.connection || queue.connection.state.status === VoiceConnectionStatus.Disconnected) {
        try {
          queue.connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guildId,
            adapterCreator: message.guild.voiceAdapterCreator,
          });

          await entersState(queue.connection, VoiceConnectionStatus.Ready, 30_000);
        } catch (error) {
          console.error('Ses kanalına bağlanma hatası:', error);
          return message.reply('❌ Ses kanalına bağlanılamadı!');
        }
      }

      queue.songs.push(song);

      if (!queue.isPlaying) {
        await playSong(message, song);
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('🎵 Şu anda çalıyor')
          .setDescription(`[${song.title}](${song.url})`)
          .setThumbnail(song.thumbnail)
          .setFooter({ text: `Talep eden: ${message.author.username}` });
        message.reply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('➕ Kuyrukta eklendi')
          .setDescription(`[${song.title}](${song.url})`)
          .setFooter({ text: `Kuyruk konumu: ${queue.songs.length}` });
        message.reply({ embeds: [embed] });
      }
    }

    // !stop komutu
    else if (command === 'stop') {
      const queue = getQueue(message.guildId);
      if (!queue.isPlaying) {
        return message.reply('❌ Şu anda müzik çalmıyor!');
      }

      queue.songs = [];
      queue.isPlaying = false;
      if (queue.player) {
        queue.player.stop();
      }
      if (queue.connection) {
        queue.connection.destroy();
        queue.connection = null;
      }

      message.reply('⏹️ Müzik durduruldu ve bot ayrıldı.');
    }

    // !pause komutu
    else if (command === 'pause') {
      const queue = getQueue(message.guildId);
      if (!queue.isPlaying || !queue.player) {
        return message.reply('❌ Şu anda müzik çalmıyor!');
      }

      queue.player.pause();
      message.reply('⏸️ Müzik duraklatıldı.');
    }

    // !resume komutu
    else if (command === 'resume') {
      const queue = getQueue(message.guildId);
      if (!queue.player) {
        return message.reply('❌ Oynatıcı hazır değil!');
      }

      queue.player.unpause();
      message.reply('▶️ Müzik devam ediyor.');
    }

    // !skip komutu
    else if (command === 'skip') {
      const queue = getQueue(message.guildId);
      if (!queue.isPlaying) {
        return message.reply('❌ Şu anda müzik çalmıyor!');
      }

      queue.songs.shift();
      if (queue.player) {
        queue.player.stop();
      }

      if (queue.songs.length > 0) {
        await playSong(message, queue.songs[0]);
        message.reply(`⏭️ Atlandı! Şimdi: **${queue.songs[0].title}**`);
      } else {
        queue.isPlaying = false;
        message.reply('⏭️ Atlandı! Kuyrukta başka müzik yok.');
      }
    }

    // !queue komutu
    else if (command === 'queue') {
      const queue = getQueue(message.guildId);
      if (queue.songs.length === 0) {
        return message.reply('❌ Kuyruk boş!');
      }

      const queueList = queue.songs
        .slice(0, 10)
        .map((song, i) => `${i + 1}. [${song.title}](${song.url})`)
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📋 Müzik Kuyruğu')
        .setDescription(queueList || 'Kuyruk boş')
        .setFooter({ text: `Toplam: ${queue.songs.length} şarkı` });

      message.reply({ embeds: [embed] });
    }

    // !now komutu
    else if (command === 'now') {
      const queue = getQueue(message.guildId);
      if (!queue.currentSong) {
        return message.reply('❌ Şu anda müzik çalmıyor!');
      }

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🎵 Şu anda çalıyor')
        .setDescription(`[${queue.currentSong.title}](${queue.currentSong.url})`)
        .setThumbnail(queue.currentSong.thumbnail);

      message.reply({ embeds: [embed] });
    }

    // !volume komutu
    else if (command === 'volume') {
      const queue = getQueue(message.guildId);
      const volume = parseInt(args[0]);

      if (isNaN(volume) || volume < 0 || volume > 100) {
        return message.reply('❌ Ses seviyesi 0-100 arasında olmalı!');
      }

      queue.volume = volume / 100;
      if (queue.player && queue.player.state.resource) {
        queue.player.state.resource.volume.setVolume(queue.volume);
      }

      message.reply(`🔊 Ses seviyesi: **${volume}%**`);
    }

    // !help komutu
    else if (command === 'help') {
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎵 Müzik Bot Komutları')
        .addFields(
          { name: '!play [müzik adı]', value: 'YouTube\'dan müzik çalar' },
          { name: '!stop', value: 'Müzik durdurur ve botu ayrıştırır' },
          { name: '!pause', value: 'Müzik duraklatır' },
          { name: '!resume', value: 'Müzik devam eder' },
          { name: '!skip', value: 'Sonraki müziğe geçer' },
          { name: '!queue', value: 'Sıradaki müzikleri gösterir' },
          { name: '!now', value: 'Şu anda çalan müziği gösterir' },
          { name: '!volume [0-100]', value: 'Ses seviyesini ayarlar' },
          { name: '!help', value: 'Bu menüyü gösterir' }
        )
        .setFooter({ text: 'Discord Müzik Bot v1.0' });

      message.reply({ embeds: [embed] });
    }

  } catch (error) {
    console.error('Komut hatası:', error);
    message.reply('❌ Komut çalıştırılırken hata oluştu!');
  }
});

// Hata yönetimi
client.on('error', error => {
  console.error('Discord istemci hatası:', error);
});

process.on('unhandledRejection', error => {
  console.error('İşlenmemiş Promise reddi:', error);
});

// Botu başlat
client.login(process.env.DISCORD_TOKEN);

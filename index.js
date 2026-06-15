require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const VC_CHANNEL_ID = '1355954764155981924';
const GUILD_ID = '1163523403404296192';

function joinVC() {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.error('❌ Guild not found. Check GUILD_ID in .env');
    return;
  }

  try {
    joinVoiceChannel({
      channelId: VC_CHANNEL_ID,
      guildId: GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true,
    });
    console.log('🤖 Shadow bot sitting in VC...');
  } catch (err) {
    console.error('❌ Failed to join VC:', err.message);
    // Retry after 5 seconds on error
    setTimeout(joinVC, 5000);
  }
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  joinVC();
});

client.on('voiceStateUpdate', () => {
  const connection = getVoiceConnection(GUILD_ID);
  if (!connection) {
    console.log('⚡ Disconnected — rejoining VC...');
    joinVC();
  }
});

// Handle unexpected errors without crashing
client.on('error', (err) => {
  console.error('⚠️  Client error:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('⚠️  Unhandled rejection:', err.message);
});

client.login(process.env.TOKEN);
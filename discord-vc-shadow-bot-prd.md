# PRD — Discord VC Shadow Bot

## Overview

A lightweight Discord bot that silently sits in a voice channel 24/7 as a shadow presence. Its only job is to make sure the VC timer never resets — even during emergency gaps when a real user disconnects due to electricity cuts, network issues, or handoff delays.

---

## Problem

A group of 6 friends are running a continuous Discord VC session to build a shared memory. They take shifts manually to keep the timer alive. The risk: if even a 1-second gap occurs between one person leaving and another joining, the timer resets to zero. Electricity cuts and real-life emergencies make this gap a genuine threat.

---

## Goal

Deploy a bot that is always present in the VC as a silent backup — so the timer is never at risk regardless of what happens with real users.

---

## Users

- 6 real users taking VC shifts
- 1 bot (shadow presence, never interacts)

---

## Core Behavior

### 1. Always in VC
- Bot joins the target voice channel immediately on startup
- Bot never leaves voluntarily
- Bot is self-muted and self-deafened at all times
- Bot does not speak, play audio, or interact in any way

### 2. Auto-Reconnect
- If the bot gets disconnected for any reason (server restart, network blip, Discord kick), it must automatically rejoin the VC within seconds
- Reconnect logic triggers on `voiceStateUpdate` event

### 3. Silent Operation
- No messages sent to any text channel
- No status updates
- No commands needed
- Just sits there invisibly

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js |
| Discord Library | discord.js v14 |
| Voice | @discordjs/voice + @discordjs/opus |
| Config | dotenv (.env file) |
| Hosting | Railway (free tier, always-on) |

---

## File Structure

```
discord-vc-shadow-bot/
├── index.js        ← main bot logic
├── .env            ← secret tokens and IDs
├── package.json    ← dependencies
└── .gitignore      ← ignore .env on GitHub
```

---

## Environment Variables (.env)

```
TOKEN=your_discord_bot_token
GUILD_ID=your_server_id
CHANNEL_ID=your_vc_channel_id
```

---

## index.js — Full Code

```javascript
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const VC_CHANNEL_ID = process.env.CHANNEL_ID;
const GUILD_ID = process.env.GUILD_ID;

function joinVC() {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return;

  joinVoiceChannel({
    channelId: VC_CHANNEL_ID,
    guildId: GUILD_ID,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: true,
  });

  console.log('🤖 Shadow bot sitting in VC...');
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

client.login(process.env.TOKEN);
```

---

## package.json

```json
{
  "name": "discord-vc-shadow-bot",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "discord.js": "^14.0.0",
    "@discordjs/voice": "^0.17.0",
    "@discordjs/opus": "^0.9.0",
    "dotenv": "^16.0.0"
  }
}
```

---

## .gitignore

```
.env
node_modules/
```

---

## Discord Bot Setup (One Time)

1. Go to https://discord.com/developers/applications
2. Click **New Application** → name it anything
3. Go to **Bot** tab → click **Add Bot**
4. Copy the **Token** → paste in `.env` as TOKEN
5. Under **Privileged Gateway Intents** → enable **Server Members Intent**
6. Go to **OAuth2 → URL Generator**
   - Scopes: `bot`
   - Bot Permissions: `Connect`, `Speak`
7. Open the generated URL → invite bot to your server
8. Get your Server ID and VC Channel ID (enable Developer Mode in Discord settings → right click → Copy ID)

---

## Hosting on Railway (Free, 24/7)

1. Push code to a GitHub repo (make sure `.env` is in `.gitignore`)
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard:
   - TOKEN
   - GUILD_ID
   - CHANNEL_ID
4. Deploy — bot runs forever even when your PC is off

---

## What the Bot Does NOT Do

- Does not play music
- Does not send messages
- Does not respond to commands
- Does not track users
- Does not store any data

---

## Success Criteria

- Bot is visible in VC at all times ✅
- Bot never causes the timer to reset ✅
- Bot automatically rejoins if disconnected ✅
- Bot costs ₹0 to run ✅
- Real users can still talk freely without any interference ✅

---

## Future Scope (Optional)

- `!timer` command to display current VC duration in chat
- Milestone alerts (48hrs, 100hrs, 500hrs) posted to a text channel
- Shift reminder pings to keep handoffs smooth

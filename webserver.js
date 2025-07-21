// webserver.js
// Menjalankan Express web server dan bot Discord secara bersamaan
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Client, GatewayIntentBits } = require('discord.js');
const { handleWebForm } = require('./commands/ejs/custch');
require('dotenv').config();

// --- Setup Discord Bot ---
const bot = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers
] });

bot.once('ready', () => {
  console.log(`Bot siap sebagai ${bot.user.tag}`);
});
bot.login(process.env.DISCORD_TOKEN);

// --- Setup Express Web Server ---
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'web')));
app.use(express.json());

// Upload icon (gradient)
const upload = multer({ dest: path.join(__dirname, 'data', 'uploads') });
app.post('/api/upload', upload.single('icon'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Simulasi: return path lokal (di produksi, upload ke CDN/public folder)
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'data', 'uploads')));

// Submit form
app.post('/api/submit', async (req, res) => {
  try {
    await handleWebForm(bot, req.body);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Web server berjalan di http://localhost:${PORT}`);
});

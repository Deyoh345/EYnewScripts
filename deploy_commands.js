
require('dotenv').config();
const { REST, Routes } = require('discord.js');

// Debug: log token and client id (hide token for safety)
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error('ERROR: DISCORD_TOKEN atau CLIENT_ID tidak ditemukan di .env!');
  process.exit(1);
}
if (process.env.DISCORD_TOKEN.length < 30) {
  console.error('ERROR: DISCORD_TOKEN terlalu pendek, kemungkinan salah.');
  process.exit(1);
}
console.log('CLIENT_ID:', process.env.CLIENT_ID);
console.log('DISCORD_TOKEN: *****' + process.env.DISCORD_TOKEN.slice(-8)); // only show last 8 chars


const fs = require('fs');
const path = require('path');

const commands = [];

let totalSubcommands = 0;
function collectCommands(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      collectCommands(filePath);
    } else if (file.endsWith('.js')) {
      try {
        const mod = require(filePath);
        if (mod && mod.name && mod.description) {
          // Jika ada subcommands (options type 1), hitung dan masukkan ke body
          let options = Array.isArray(mod.options) ? mod.options : [];
          let subCount = 0;
          let optionsForApi = [];
          for (const opt of options) {
            if (opt.type === 1) subCount++;
            optionsForApi.push(opt);
          }
          totalSubcommands += subCount;
          commands.push({ name: mod.name, description: mod.description, options: optionsForApi });
        }
      } catch (e) {
        console.error('Gagal load command:', filePath, e);
      }
    }
  }
}

const commandsPath = path.join(__dirname, 'commands', 'ejs');
collectCommands(commandsPath);
console.log(`Jumlah commands yang ditemukan dan akan didaftarkan: ${commands.length}`);
console.log(`Total subcommands (type 1) terdaftar: ${totalSubcommands}`);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Deploying (registering) commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('Commands deployed globally!');
  } catch (error) {
    console.error(error);
  }
})();

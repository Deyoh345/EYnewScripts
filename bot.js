require('dotenv').config();

const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const emping = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
] });

emping.once('ready', () => {
    console.log(`Bot JS siap sebagai ${emping.user.tag}`);
    emping.user.setActivity('Empire Yapping', { type: ActivityType.Streaming, url: 'https://www.twitch.tv/deyohhh_?sr=a' });
});

// Handler untuk slash command
const commands = new Map();
const fs = require('fs');
const path = require('path');

function loadCommands(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            const command = require(filePath);
            if (command && command.name && typeof command.execute === 'function') {
                commands.set(command.name, command);
            }
        }
    }
}

const commandsPath = path.join(__dirname, 'commands', 'ejs');
loadCommands(commandsPath);

emping.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: 'Terjadi error saat menjalankan command.' });
        } else {
            await interaction.reply({ content: 'Terjadi error saat menjalankan command.', ephemeral: true });
        }
    }
});


emping.on('messageCreate', message => {
    if (message.content === '!halojs') {
        message.reply('Halo dari bot JavaScript!');
    }
});

const { handleGuildJoin } = require('./utils/js/sayingThanksHandle');

emping.on('guildCreate', async guild => {
    // Kirim ucapan terima kasih otomatis
    await handleGuildJoin(guild, emping);
});

emping.login(process.env.DISCORD_TOKEN);

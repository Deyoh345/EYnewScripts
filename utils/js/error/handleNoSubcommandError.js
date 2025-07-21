// utils/js/error/handleNoSubcommandError.js
// Handler khusus untuk error CommandInteractionOptionNoSubcommand pada command dengan subcommand
const fs = require('fs');
const path = require('path');

function handleNoSubcommandError(interaction, commandName) {
    const userMessage = {
        content: `❌ Perintah "/${commandName}" memerlukan subcommand. Silakan gunakan "/${commandName} help" untuk melihat daftar subcommand yang tersedia.`,
        ephemeral: true
    };
    // Cek sudah reply/deferred atau belum
    if (interaction.deferred || interaction.replied) {
        interaction.followUp(userMessage).catch(() => {});
    } else {
        interaction.reply(userMessage).catch(() => {});
    }
    // Logging ke file
    const logDir = path.join(__dirname, '../../../logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const logPath = path.join(logDir, `${commandName}.ey`);
    const logMsg = `[${new Date().toISOString()}] [NO_SUBCOMMAND] User: ${interaction?.user?.id || 'unknown'} (${interaction?.user?.tag || 'unknown'}) tried /${commandName} without subcommand\n`;
    fs.appendFileSync(logPath, logMsg);
}

module.exports = handleNoSubcommandError;

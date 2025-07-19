// boosterinfo.js
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'boosterinfo',
    description: 'Menampilkan jumlah boosts dan user yang boosts server',
    async execute(interaction) {
        const fs = require('fs');
        const path = require('path');
        let replied = false;
        try {
            await interaction.deferReply();
            replied = true;
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return await interaction.editReply({ content: 'Perintah ini hanya bisa dijalankan oleh admin.' });
            }

            const guild = interaction.guild;
            await guild.members.fetch();
            const boosters = guild.members.cache.filter(m => m.premiumSince);
            const boostCount = guild.premiumSubscriptionCount || boosters.size;
            const boosterList = boosters.map(m => `- ${m.user.tag}`).join('\n') || 'Tidak ada booster.';

            const embed = new EmbedBuilder()
                .setTitle('Server Boost Info')
                .setColor('#f47fff')
                .addFields(
                    { name: 'Jumlah Boosts', value: `${boostCount}`, inline: true },
                    { name: 'User yang boost server', value: boosterList, inline: false }
                )
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            const logDir = path.join(__dirname, '../../logs', path.basename(__filename, '.js') + '.ey');
            if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
            fs.writeFileSync(path.join(logDir, 'error.log'), `${err.stack}`);
            console.error(err);
            if (replied) {
                await interaction.editReply({ content: 'Terjadi error saat mengambil data booster. Pastikan bot memiliki permission yang cukup.' });
            } else {
                try {
                    await interaction.reply({ content: 'Terjadi error saat mengambil data booster. Pastikan bot memiliki permission yang cukup.', ephemeral: true });
                } catch {}
            }
        }
    }
};

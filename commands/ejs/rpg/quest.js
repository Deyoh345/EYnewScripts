// quest.js - Command frontend untuk fitur quest RPG Empire Yapping
const { EmbedBuilder } = require('discord.js');
const rpgQuest = require('../../../utils/js/rpgQuest');

module.exports = {
    name: 'quest',
    description: 'Lihat dan klaim quest di Empire Yapping',
    options: [
        {
            name: 'list',
            description: 'Lihat daftar quest aktif',
            type: 1
        },
        {
            name: 'progress',
            description: 'Lihat progress quest-mu',
            type: 1
        },
        {
            name: 'claim',
            description: 'Klaim hadiah quest',
            type: 1,
            options: [
                { name: 'quest', description: 'Nama quest', type: 3, required: true }
            ]
        }
    ],
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        if (sub === 'list') {
            const quests = rpgQuest.getActiveQuests();
            const embed = new EmbedBuilder()
                .setTitle('Daftar Quest Aktif')
                .setColor('#c2b280')
                .setDescription('Quest yang bisa kamu ambil:')
                .addFields(quests.map(q => ({ name: q.nama, value: q.deskripsi, inline: false })))
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 'progress') {
            const progress = rpgQuest.getUserQuestProgress(userId);
            const embed = new EmbedBuilder()
                .setTitle('Progress Quest-mu')
                .setColor('#c2b280')
                .setDescription(progress.length ? progress.map(p => `**${p.nama}**: ${p.status}`).join('\n') : 'Belum ada progress quest.')
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 'claim') {
            const questName = interaction.options.getString('quest');
            const result = rpgQuest.claimQuest(userId, questName);
            if (result.success) {
                return interaction.editReply({ content: `Berhasil klaim hadiah quest: ${questName}!` });
            } else {
                return interaction.editReply({ content: `Gagal klaim quest: ${result.msg}` });
            }
        }
    }
};

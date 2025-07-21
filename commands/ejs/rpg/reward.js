// reward.js - Command frontend untuk fitur reward RPG Empire Yapping
const { EmbedBuilder } = require('discord.js');
const rpgReward = require('../../../utils/js/rpgReward');

module.exports = {
    name: 'reward',
    description: 'Lihat dan klaim reward di Empire Yapping',
    options: [
        {
            name: 'list',
            description: 'Lihat daftar reward',
            type: 1
        },
        {
            name: 'claim',
            description: 'Klaim reward',
            type: 1,
            options: [
                { name: 'reward', description: 'Nama reward', type: 3, required: true }
            ]
        }
    ],
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        if (sub === 'list') {
            const rewards = rpgReward.getRewardList();
            const embed = new EmbedBuilder()
                .setTitle('Daftar Reward')
                .setColor('#c2b280')
                .setDescription('Reward yang bisa kamu klaim:')
                .addFields(rewards.map(r => ({ name: r.nama, value: r.deskripsi, inline: false })))
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 'claim') {
            const rewardName = interaction.options.getString('reward');
            const result = rpgReward.claimReward(userId, rewardName);
            if (result.success) {
                return interaction.editReply({ content: `Berhasil klaim reward: ${rewardName}!` });
            } else {
                return interaction.editReply({ content: `Gagal klaim reward: ${result.msg}` });
            }
        }
    }
};

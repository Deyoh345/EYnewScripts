// conqueror_help.js - Bantuan untuk sistem Conqueror's Path
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'conquerorhelp',
    description: 'Lihat penjelasan dan bantuan sistem Conqueror\'s Path',
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Panduan Conqueror\'s Path')
            .setColor('#bfa14a')
            .setDescription('Sistem leveling dan penaklukan wilayah ala Empire Yapping!')
            .addFields(
                { name: 'Tujuan', value: 'Menaklukkan wilayah baru, memperkuat militer, dan menjadi penakluk terhebat.' },
                { name: 'Perintah Utama', value: '/conqueror profile, /conqueror taklukkan, /conqueror upgrade, /conqueror strategi, /conqueror alliance' },
                { name: 'Leveling', value: 'Setiap wilayah baru = exp & level. Level lebih tinggi = militer lebih kuat.' },
                { name: 'Upgrade Militer', value: 'Upgrade infantri, kavaleri, artileri untuk memperkuat pasukan.' },
                { name: 'Strategi', value: 'Pilih strategi tempur: agresif, bertahan, cepat.' },
                { name: 'Alliance', value: 'Gabung/buat alliance untuk kolaborasi penaklukan.' },
                { name: 'Reward', value: 'Wilayah, exp, gold, legion, gelar, dan reputasi.' }
            )
            .setFooter({ text: 'Empire Yapping - Conqueror\'s Path' })
            .setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

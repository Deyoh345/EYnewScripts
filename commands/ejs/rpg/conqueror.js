// conqueror.js - Command utama untuk fitur Conqueror's Path
const { EmbedBuilder } = require('discord.js');
const conqueror = require('../../../utils/js/conquerorPath');

module.exports = {
    name: 'conqueror',
    description: 'Conqueror\'s Path: profil, taklukkan, upgrade, strategi, alliance',
    options: [
        { name: 'p', description: 'Profil', type: 1 },
        { name: 't', description: 'Taklukkan wilayah', type: 1 },
        { name: 'u', description: 'Upgrade militer', type: 1, options: [
            { name: 'tipe', description: 'infantri/kavaleri/artileri', type: 3, required: true },
            { name: 'jumlah', description: 'Jumlah', type: 4, required: false }
        ] },
        { name: 's', description: 'Strategi tempur', type: 1, options: [
            { name: 'strategi', description: 'Strategi', type: 3, required: true }
        ] },
        { name: 'a', description: 'Alliance', type: 1, options: [
            { name: 'nama', description: 'Nama alliance', type: 3, required: true }
        ] }
    ],
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const userId = interaction.user.id;
        const sub = interaction.options.getSubcommand();
        const hWilayah = require('../../../utils/js/handleWilayah');
        if (sub === 'p') {
            const conquerorPath = require('../../../utils/js/conquerorPath');
            const hWilayah = require('../../../utils/js/handleWilayah');
            const data = conquerorPath.getConquerorData(userId) || conquerorPath.initConqueror(userId);
            const wilayahList = (data.wilayah || []).map(idx => hWilayah.getNamaWilayah(idx)).join(', ') || '-';
            // Ambil info fractio user dari collegium.json
            const path = require('path');
            const fs = require('fs');
            const collegiumPath = path.join(__dirname, '../../../data/collegium.json');
            let fractioInfo = null;
            if (fs.existsSync(collegiumPath)) {
                const collegiumDB = JSON.parse(fs.readFileSync(collegiumPath, 'utf8'));
                // Cari fractio yang berisi userId
                const yappa = collegiumDB.collegia && collegiumDB.collegia['Yappa Romana'];
                if (yappa && Array.isArray(yappa.fractio)) {
                    for (const f of yappa.fractio) {
                        if (f.anggota && f.anggota.includes(userId)) {
                            fractioInfo = f;
                            break;
                        }
                    }
                }
            }
            let fractioField = { name: 'Fractio', value: '-', inline: false };
            if (fractioInfo) {
                fractioField = {
                    name: `Fractio: ${fractioInfo.nama}`,
                    value: `Ketua: <@${fractioInfo.ketua}>\nAnggota: ${fractioInfo.anggota.length}\nRole: ${(fractioInfo.roles && fractioInfo.roles[userId]) || '-'}`,
                    inline: false
                };
            }
            const embed = new EmbedBuilder()
                .setTitle('Conqueror\'s Path & Fractio')
                .setColor('#bfa14a')
                .addFields(
                    { name: 'Level', value: String(data.level), inline: true },
                    { name: 'Exp', value: String(data.exp), inline: true },
                    { name: 'Wilayah', value: wilayahList, inline: false },
                    { name: 'Militer', value: `Inf: ${data.militer.infantri} | Kav: ${data.militer.kavaleri} | Art: ${data.militer.artileri}`, inline: false },
                    { name: 'Strategi', value: data.strategi || '-', inline: true },
                    { name: 'Alliance', value: data.alliance || '-', inline: true },
                    { name: 'Gelar', value: (data.gelar || []).join(', ') || '-', inline: false },
                    fractioField
                )
                .setFooter({ text: 'Empire Yapping - Conqueror\'s Path' })
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 't') {
            const result = require('../../../utils/js/conquerorPath').taklukkanWilayah(userId);
            if (!result.success) return interaction.editReply(result.msg);
            let msg = `Wilayah baru: **${result.wilayah}**! (+${result.expGain} exp)`;
            if (result.naikLevel) msg += `\nLevel up! Sekarang: ${result.level}`;
            return interaction.editReply(msg);
        } else if (sub === 'u') {
            const tipe = interaction.options.getString('tipe');
            const jumlah = interaction.options.getInteger('jumlah') || 1;
            if (!['infantri','kavaleri','artileri'].includes(tipe)) return interaction.editReply('Tipe tidak valid!');
            require('../../../utils/js/conquerorPath').upgradeMiliter(userId, tipe, jumlah);
            return interaction.editReply(`Upgrade ${tipe} +${jumlah} berhasil!`);
        } else if (sub === 's') {
            const strategi = interaction.options.getString('strategi');
            require('../../../utils/js/conquerorPath').setStrategi(userId, strategi);
            return interaction.editReply(`Strategi: **${strategi}**`);
        } else if (sub === 'a') {
            const nama = interaction.options.getString('nama');
            require('../../../utils/js/conquerorPath').setAlliance(userId, nama);
            return interaction.editReply(`Alliance: **${nama}**`);
        }
    }
};

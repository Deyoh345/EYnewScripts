// start.js - Command: Daftar RPG Empire Yapping
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/rpg_users.json');

function loadDB() {
    if (!fs.existsSync(dbPath)) return {};
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveDB(db) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = {
    name: 'startrpg',
    description: 'Daftar dan mulai petualangan Event Empire Yapping!',
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const userId = interaction.user.id;
            let db = loadDB();
            if (db[userId]) {
                return await interaction.editReply({ content: 'Kamu sudah terdaftar di Event Empire Yapping! Gunakan perintah lain untuk bermain.' });
            }
            db[userId] = {
                username: interaction.user.tag,
                gold: 100,
                legion: 10,
                conquered: 0,
                registeredAt: new Date().toISOString()
            };
            saveDB(db);
            const embed = new EmbedBuilder()
                .setTitle('🏛️ Pendaftaran Event Empire Yapping Berhasil!')
                .setColor('#c2b280')
                .setDescription('Selamat datang di Empire Yapping Event! Kamu telah terdaftar dan siap memulai petualangan.')
                .addFields(
                    { name: 'Gold Awal', value: '100', inline: true },
                    { name: 'Legion Awal', value: '10', inline: true },
                    { name: 'Wilayah Dikuasai', value: '0', inline: true }
                )
                .setFooter({ text: 'Empire Yapping!'} )
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            await interaction.editReply({ content: 'Terjadi error saat pendaftaran RPG.' });
        }
    }
};

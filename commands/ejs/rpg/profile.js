// profile.js - Fun RPG Profile dengan Canvas bertema Empire Yapping
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/rpg_users.json');

function loadDB() {
    if (!fs.existsSync(dbPath)) return {};
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

module.exports = {
    name: 'profile',
    description: 'Lihat profil RPG Empire Yapping-mu dengan tampilan modern dan cantik! Gunakan /profile [user]',
    options: [
        {
            name: 'user',
            description: 'User yang ingin dilihat profilnya',
            type: 6, // USER
            required: false
        }
    ],
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: false });
            let targetUser = interaction.options && typeof interaction.options.getUser === 'function'
                ? interaction.options.getUser('user')
                : null;
            if (!targetUser) targetUser = interaction.user;
            const userId = targetUser.id;
            let db = loadDB();
            if (!db[userId]) {
                return await interaction.editReply({ content: `User <@${userId}> belum terdaftar di Event Empire Yapping! Gunakan /startrpg untuk mendaftar.` });
            }
            const user = db[userId];

            // Canvas profile
            const canvas = createCanvas(600, 300);
            const ctx = canvas.getContext('2d');

            // Background gradient
            const grad = ctx.createLinearGradient(0, 0, 600, 300);
            grad.addColorStop(0, '#c2b280');
            grad.addColorStop(1, '#fffbe6');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 600, 300);

            // Roman border
            ctx.strokeStyle = '#bfa14a';
            ctx.lineWidth = 8;
            ctx.strokeRect(10, 10, 580, 280);

            // Title
            ctx.font = 'bold 32px Segoe UI, Arial';
            ctx.fillStyle = '#7c5c1e';
            ctx.textAlign = 'center';
            ctx.fillText('EMPIRE YAPPING PROFILE', 300, 50);

            // Info box dengan background kuning-putih
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(160, 70);
            ctx.lineTo(570, 70);
            ctx.quadraticCurveTo(590, 70, 590, 90);
            ctx.lineTo(590, 250);
            ctx.quadraticCurveTo(590, 270, 570, 270);
            ctx.lineTo(160, 270);
            ctx.quadraticCurveTo(140, 270, 140, 250);
            ctx.lineTo(140, 90);
            ctx.quadraticCurveTo(140, 70, 160, 70);
            ctx.closePath();
            ctx.fillStyle = '#fffbe6';
            ctx.fill();
            ctx.restore();

            // Judul profil
            ctx.font = 'bold 28px Segoe UI, Arial';
            ctx.fillStyle = '#bfa14a';
            ctx.textAlign = 'left';
            ctx.fillText(user.username, 170, 110);
            ctx.font = '20px Segoe UI, Arial';
            ctx.fillStyle = '#7c5c1e';
            ctx.fillText(`Gold: ${user.gold}`, 170, 150);
            ctx.fillText(`Legion: ${user.legion}`, 170, 180);
            ctx.fillText(`Wilayah: ${user.conquered}`, 170, 210);

            // Fractio
            let fractioName = '';
            try {
                const collegiumPath = path.join(__dirname, '../../../data/collegium.json');
                if (fs.existsSync(collegiumPath)) {
                    const collegiumDB = JSON.parse(fs.readFileSync(collegiumPath, 'utf8'));
                    // Cari fractio yang user ikuti
                    outer: for (const namaCol in collegiumDB.collegia) {
                        const collegium = collegiumDB.collegia[namaCol];
                        if (Array.isArray(collegium.fractio)) {
                            for (const f of collegium.fractio) {
                                if (f.anggota && f.anggota.includes(userId)) {
                                    fractioName = f.nama;
                                    break outer;
                                }
                            }
                        }
                    }
                }
            } catch {}
            ctx.font = '18px Segoe UI, Arial';
            ctx.fillStyle = '#888';
            ctx.fillText(`Fractio: ${fractioName || '-'}`, 170, 230);
            ctx.font = '18px Segoe UI, Arial';
            ctx.fillStyle = '#888';
            ctx.fillText(`Bergabung: ${new Date(user.registeredAt).toLocaleDateString()}`, 170, 250);

            // Avatar lingkaran sederhana (tanpa load gambar)
            ctx.save();
            ctx.beginPath();
            ctx.arc(100, 170, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = '#ffe066';
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#bfa14a';
            ctx.stroke();
            ctx.font = 'bold 36px Segoe UI, Arial';
            ctx.fillStyle = '#bfa14a';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((user.username && user.username[0]) ? user.username[0].toUpperCase() : 'U', 100, 170);
            ctx.restore();

            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'profile.png' });
            const embed = new EmbedBuilder()
                .setTitle('Profil Empire Yapping')
                .setColor('#c2b280')
                .setDescription(`Profil RPG untuk **${user.username}**`)
                .setImage('attachment://profile.png')
                .setFooter({ text: 'Empire Yapping!' })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed], files: [attachment] });
        } catch (err) {
            await interaction.editReply({ content: 'Terjadi error saat mengambil profil RPG.' });
        }
    }
};

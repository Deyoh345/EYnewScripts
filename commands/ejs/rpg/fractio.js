
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const { getWilayahCollegium } = require('../../../utils/js/handleWilayah');
const dbPath = path.join(__dirname, '../../../data/collegium.json');

// Helper DB
function loadDB() {
    if (!fs.existsSync(dbPath)) return { collegia: {}, fractioRequests: [] };
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveDB(db) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = {
    name: 'fractio',
    description: 'Ajukan dan kelola fractio (asosiasi bagian)',
    options: [
        {
            name: 'ajukan',
            description: 'Ajukan fractio baru',
            type: 1,
            options: [
                { name: 'nama', description: 'Nama fractio', type: 3, required: true },
                { name: 'collegium', description: 'Collegium induk', type: 3, required: true },
                { name: 'logo', description: 'Logo fractio (URL gambar, opsional)', type: 3, required: false }
            ]
        },
        {
            name: 'list',
            description: 'Lihat daftar fractio',
            type: 1
        },
        {
            name: 'setrole',
            description: 'Atur peran anggota fractio',
            type: 1,
            options: [
                { name: 'user', description: 'User', type: 6, required: true },
                { name: 'role', description: 'Peran (ketua/anggota)', type: 3, required: true }
            ]
        },
        {
            name: 'approve',
            description: 'Setujui permintaan fractio (khusus Praefectus Fractionum)',
            type: 1,
            options: [
                { name: 'nama', description: 'Nama fractio', type: 3, required: true },
                { name: 'setuju', description: 'Setujui? (ya/tidak)', type: 3, required: true }
            ]
        }
    ],
    async execute(interaction) {
        const { handleNoSubcommandError } = require('../../../utils/js/error');
        await interaction.deferReply({ ephemeral: false });
        const db = loadDB();
        let sub;
        try {
            sub = interaction.options.getSubcommand();
        } catch (err) {
            if (
                err.code === 'CommandInteractionOptionNoSubcommand' ||
                err.message?.includes('No subcommand specified') ||
                err.name === 'DiscordjsTypeError' ||
                err.name === 'TypeError [CommandInteractionOptionNoSubcommand]'
            ) {
                handleNoSubcommandError(interaction, 'fractio');
                return;
            } else {
                throw err;
            }
        }
        if (sub === 'ajukan') {
            const nama = interaction.options.getString('nama');
            const collegium = interaction.options.getString('collegium');
            const logo = interaction.options.getString('logo');
            if (!db.collegia[collegium]) return interaction.editReply('Collegium tidak ditemukan!');
            // Cek duplikat permintaan atau fractio sudah ada
            if (db.fractioRequests.some(r => r.nama === nama && r.status === 'pending')) {
                return interaction.editReply('Sudah ada permintaan fractio dengan nama tersebut yang masih pending.');
            }
            for (const cName in db.collegia) {
                if (db.collegia[cName].fractio && db.collegia[cName].fractio.some(f => f.nama === nama)) {
                    return interaction.editReply('Nama fractio sudah digunakan.');
                }
            }
            // Tambahkan 5 wilayah acak ke fractio request
            const wilayah = getWilayahCollegium(5);
            db.fractioRequests.push({ nama, collegium, pembuat: interaction.user.id, status: 'pending', logo, wilayah });
            saveDB(db);
            return interaction.editReply(`Permintaan fractio **${nama}** untuk collegium **${collegium}** diajukan! Menunggu persetujuan Praefectus Fractionum.`);
        } else if (sub === 'list') {
            // Generate list data
            let fractioList = [];
            for (const nama in db.collegia) {
                const col = db.collegia[nama];
                if (!col || typeof col !== 'object') continue;
                if (!Array.isArray(col.fractio)) continue;
            for (const f of col.fractio) {
                if (!f || typeof f !== 'object' || !f.nama || !f.ketua) continue;
                fractioList.push({
                    nama: f.nama,
                    collegium: nama,
                    ketua: f.ketua,
                    anggota: Array.isArray(f.anggota) ? f.anggota.length : 0,
                    anggotaMax: 50,
                    logo: f.logo || null
                });
            }
            }
            let pendingList = [];
            if (Array.isArray(db.fractioRequests) && db.fractioRequests.length > 0) {
                for (const req of db.fractioRequests) {
                    if (req && typeof req === 'object' && req.status === 'pending' && req.nama && req.pembuat && req.collegium) {
                        pendingList.push(req);
                    }
                }
            }

            // Generate image with canvas
            const { createCanvas, registerFont } = require('canvas');
            const width = 700;
            const baseHeight = 80;
            const rowHeight = 48;
            const pendingHeight = pendingList.length > 0 ? (pendingList.length * 32 + 40) : 0;
            const height = baseHeight + (fractioList.length * rowHeight) + pendingHeight;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = '#fffbe6';
            ctx.fillRect(0, 0, width, height);

            // Title
            ctx.font = 'bold 32px Segoe UI, Arial';
            ctx.fillStyle = '#bfa14a';
            ctx.textAlign = 'center';
            ctx.fillText('DAFTAR FRACTIO', width/2, 44);

            // Table header
            ctx.font = 'bold 22px Segoe UI, Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#7c5c1e';
            ctx.fillText('Nama', 40, 80);
            ctx.fillText('Collegium', 240, 80);
            ctx.fillText('Ketua', 420, 80);
            ctx.fillText('Anggota', 580, 80);

            // Table rows
            ctx.font = '20px Segoe UI, Arial';
            let y = 110;
            // Fetch user usernames for all unique ketua IDs
            const ketuaIdSet = new Set(fractioList.map(f => f.ketua));
            const userMap = {};
            const client = interaction.client;
            for (const id of ketuaIdSet) {
                let username = id;
                // Try from guild member cache
                let member = null;
                if (interaction.guild && interaction.guild.members) {
                    member = interaction.guild.members.cache.get(id);
                }
                if (member && member.user && member.user.username) {
                    username = member.user.username;
                } else if (client && client.users) {
                    try {
                        const userObj = await client.users.fetch(id);
                        if (userObj && userObj.username) username = userObj.username;
                    } catch {}
                }
                userMap[id] = username;
            }

            for (const f of fractioList) {
                // Always set font, fillStyle, and textAlign before drawing text
                ctx.font = '20px Segoe UI, Arial';
                ctx.fillStyle = '#222';
                ctx.textAlign = 'left';
                let nameX = 40;
                let badgeDrawn = false;
                if (f.logo) {
                    try {
                        const { loadImage } = require('canvas');
                        const img = await loadImage(f.logo);
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(nameX + 16, y - 12, 16, 0, Math.PI * 2);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(img, nameX, y - 28, 32, 32);
                        ctx.restore();
                        nameX += 40;
                        badgeDrawn = true;
                    } catch (e) {
                        // If logo fails, fallback to just text
                        badgeDrawn = false;
                    }
                }
                // Draw text after badge, always
                ctx.font = '20px Segoe UI, Arial';
                ctx.fillStyle = '#222';
                ctx.textAlign = 'left';
                ctx.fillText(f.nama, nameX, y);
                ctx.fillText(f.collegium, 240, y);
                ctx.fillText(userMap[f.ketua] || f.ketua, 420, y);
                ctx.fillText(`${f.anggota}/50`, 580, y);
                y += rowHeight;
            }

            // Pending section
            if (pendingList.length > 0) {
                ctx.font = 'bold 20px Segoe UI, Arial';
                ctx.fillStyle = '#bfa14a';
                ctx.fillText('Permintaan Fractio Pending:', 40, y + 20);
                ctx.font = '18px Segoe UI, Arial';
                ctx.fillStyle = '#7c5c1e';
                let py = y + 48;
                for (const req of pendingList) {
                    ctx.fillText(`${req.nama} (oleh ${req.pembuat}, collegium: ${req.collegium})`, 60, py);
                    py += 32;
                }
            }

            // Send as attachment
            const { AttachmentBuilder } = require('discord.js');
            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'fractio-list.png' });
            return interaction.editReply({ content: 'Daftar fractio:', files: [attachment] });
        } else if (sub === 'setrole') {
            const user = interaction.options.getUser('user');
            const role = interaction.options.getString('role');
            let found = false;
            for (const nama in db.collegia) {
                if (!db.collegia[nama].fractio) continue;
                for (const f of db.collegia[nama].fractio) {
                    if (f.anggota && f.anggota.includes(user.id)) {
                        f.roles = f.roles || {};
                        f.roles[user.id] = role;
                        found = true;
                    }
                }
            }
            if (!found) return interaction.editReply('User bukan anggota fractio manapun.');
            saveDB(db);
            return interaction.editReply(`Peran <@${user.id}> di fractio diubah menjadi **${role}**.`);
        } else if (sub === 'approve') {
            // Hanya Praefectus Fractionum yang bisa approve/deny
            const collegium = db.collegia['Yappa Romana'];
            if (!collegium || collegium.praefectus !== interaction.user.id) {
                return interaction.editReply('Hanya Praefectus Fractionum yang dapat menyetujui/menolak permintaan fractio.');
            }
            const nama = interaction.options.getString('nama');
            const setuju = interaction.options.getString('setuju');
            const reqIdx = db.fractioRequests.findIndex(r => r.nama === nama && r.status === 'pending');
            if (reqIdx === -1) return interaction.editReply('Permintaan fractio tidak ditemukan atau sudah diproses.');
            if (setuju.toLowerCase() === 'ya') {
                // Tambahkan ke fractio collegium
                if (!collegium.fractio) collegium.fractio = [];
                // Ambil wilayah dari request jika ada
                const wilayah = db.fractioRequests[reqIdx].wilayah || getWilayahCollegium(5);
                collegium.fractio.push({ nama, ketua: db.fractioRequests[reqIdx].pembuat, anggota: [db.fractioRequests[reqIdx].pembuat], roles: { [db.fractioRequests[reqIdx].pembuat]: 'ketua' }, wilayah });
                db.fractioRequests[reqIdx].status = 'approved';
                saveDB(db);
                return interaction.editReply(`Permintaan fractio **${nama}** telah disetujui dan dibuat! Wilayah: ${wilayah.join(', ')}`);
            } else {
                db.fractioRequests[reqIdx].status = 'denied';
                saveDB(db);
                return interaction.editReply(`Permintaan fractio **${nama}** ditolak.`);
            }
        }
    }
};

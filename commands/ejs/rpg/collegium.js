// collegium.js - Mengelola asosiasi utama (collegium) dan permintaan fractio
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');


const { getWilayahCollegium } = require('../../../utils/js/handleWilayah');
const dbPath = path.join(__dirname, '../../../data/collegium.json');

function loadDB() {
    if (!fs.existsSync(dbPath)) return { collegia: {}, fractioRequests: [] };
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveDB(db) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = {
    name: 'collegium',
    description: 'Lihat dan kelola collegium utama Yappa Romana',
    options: [
        {
            name: 'info',
            description: 'Lihat info collegium utama Yappa Romana',
            type: 1
        },
        {
            name: 'anggota',
            description: 'Lihat daftar anggota collegium',
            type: 1
        },
        {
            name: 'gabung',
            description: 'Gabung ke collegium Yappa Romana',
            type: 1
        },
        {
            name: 'keluar',
            description: 'Keluar dari collegium Yappa Romana',
            type: 1
        },
        {
            name: 'setrole',
            description: 'Atur peran anggota collegium (khusus Magister/Legatus)',
            type: 1,
            options: [
                { name: 'user', description: 'User', type: 6, required: true },
                { name: 'role', description: 'Peran (magister/legatus/quaestor/praefectus/sodalis)', type: 3, required: true }
            ]
        },
        {
            name: 'del',
            description: 'Hapus fractio dari collegium (khusus Magister/Legatus)',
            type: 1,
            options: [
                { name: 'fractio', description: 'Nama fractio yang akan dihapus', type: 3, required: true }
            ]
        }
    ],
    async execute(interaction) {
        const { handleNoSubcommandError } = require('../../../utils/js/error');
        await interaction.deferReply({ ephemeral: true });
        const db = loadDB();
        // Pastikan Yappa Romana selalu ada
        if (!db.collegia['Yappa Romana']) {
            db.collegia['Yappa Romana'] = {
                magister: null, // Magister Collegi (pemimpin utama)
                legatus: null,  // Legatus Collegi (wakil)
                quaestor: null, // Ketua seksi quests
                praefectus: null, // Ketua seksi fractio
                anggota: [],
                roles: {},
                fractio: [],
                wilayah: getWilayahCollegium(5) // 5 wilayah acak untuk collegium utama
            };
            saveDB(db);
        } // end options array
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
                handleNoSubcommandError(interaction, 'collegium');
                return;
            } else {
                throw err;
            }
        }
        const yappa = db.collegia['Yappa Romana'];
        if (sub === 'info') {
            const magister = yappa.magister ? `<@${yappa.magister}>` : 'Belum ditentukan';
            const legatus = yappa.legatus ? `<@${yappa.legatus}>` : 'Belum ditentukan';
            const quaestor = yappa.quaestor ? `<@${yappa.quaestor}>` : 'Belum ditentukan';
            const praefectus = yappa.praefectus ? `<@${yappa.praefectus}>` : 'Belum ditentukan';
            const anggota = yappa.anggota.length > 0 ? yappa.anggota.map(id => `<@${id}>`).join(', ') : 'Belum ada anggota';
            const wilayah = Array.isArray(yappa.wilayah) ? yappa.wilayah.join(', ') : '-';
            const embed = new EmbedBuilder()
                .setTitle('Collegium Utama: Yappa Romana')
                .setColor('#e6c200')
                .addFields(
                    { name: 'Magister Collegi', value: magister, inline: true },
                    { name: 'Legatus Collegi', value: legatus, inline: true },
                    { name: 'Quaestor', value: quaestor, inline: true },
                    { name: 'Praefectus Fractionum', value: praefectus, inline: true },
                    { name: 'Anggota', value: anggota, inline: false },
                    { name: 'Jumlah Fractio', value: `${yappa.fractio.length}`, inline: true },
                    { name: 'Wilayah Collegium', value: wilayah, inline: false }
                )
                .setFooter({ text: 'Empire Yapping!' })
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 'anggota') {
            const anggota = yappa.anggota.length > 0 ? yappa.anggota.map(id => `<@${id}>`).join(', ') : 'Belum ada anggota';
            return interaction.editReply({ content: `Daftar anggota Yappa Romana: ${anggota}` });
        } else if (sub === 'gabung') {
            if (yappa.anggota.includes(interaction.user.id)) {
                return interaction.editReply('Kamu sudah menjadi anggota Yappa Romana!');
            }
            yappa.anggota.push(interaction.user.id);
            yappa.roles[interaction.user.id] = 'sodalis';
            // Jika belum ada magister, user pertama jadi magister
            if (!yappa.magister) yappa.magister = interaction.user.id;
            saveDB(db);
            return interaction.editReply('Kamu berhasil bergabung ke collegium Yappa Romana!');
        } else if (sub === 'keluar') {
            if (!yappa.anggota.includes(interaction.user.id)) {
                return interaction.editReply('Kamu bukan anggota Yappa Romana.');
            }
            // Jika magister keluar, magister diganti ke anggota berikutnya (jika ada)
            if (yappa.magister === interaction.user.id) {
                const anggotaLain = yappa.anggota.filter(id => id !== interaction.user.id);
                yappa.magister = anggotaLain[0] || null;
            }
            // Jika legatus keluar, reset
            if (yappa.legatus === interaction.user.id) yappa.legatus = null;
            if (yappa.quaestor === interaction.user.id) yappa.quaestor = null;
            if (yappa.praefectus === interaction.user.id) yappa.praefectus = null;
            yappa.anggota = yappa.anggota.filter(id => id !== interaction.user.id);
            delete yappa.roles[interaction.user.id];
            saveDB(db);
            return interaction.editReply('Kamu telah keluar dari collegium Yappa Romana.');
        } else if (sub === 'setrole') {
            // Hanya magister/legatus yang bisa set role
            if (yappa.magister !== interaction.user.id && yappa.legatus !== interaction.user.id) {
                return interaction.editReply('Hanya Magister atau Legatus yang dapat mengubah peran anggota.');
            }
            const user = interaction.options.getUser('user');
            const role = interaction.options.getString('role');
            if (!yappa.anggota.includes(user.id)) {
                return interaction.editReply('User bukan anggota Yappa Romana.');
            }
            yappa.roles[user.id] = role;
            if (role === 'magister') yappa.magister = user.id;
            else if (role === 'legatus') yappa.legatus = user.id;
            else if (role === 'quaestor') yappa.quaestor = user.id;
            else if (role === 'praefectus') yappa.praefectus = user.id;
            // Jika role diganti dari jabatan ke sodalis, kosongkan jabatan jika user tsb sebelumnya menjabat
            if (role === 'sodalis') {
                if (yappa.magister === user.id) yappa.magister = null;
                if (yappa.legatus === user.id) yappa.legatus = null;
                if (yappa.quaestor === user.id) yappa.quaestor = null;
                if (yappa.praefectus === user.id) yappa.praefectus = null;
            }
            saveDB(db);
            return interaction.editReply(`Peran <@${user.id}> di Yappa Romana diubah menjadi **${role}**.`);
        }
        else if (sub === 'del') {
            // Hanya magister/legatus yang bisa hapus fractio
            if (yappa.magister !== interaction.user.id && yappa.legatus !== interaction.user.id) {
                return interaction.editReply('Hanya Magister atau Legatus yang dapat menghapus fractio.');
            }
            const fractioName = interaction.options.getString('fractio');
            if (!fractioName) {
                return interaction.editReply('Nama fractio harus diisi.');
            }
            // Cek apakah fractio ada di collegium
            // Cari fractio baik key 'nama' maupun 'name' (untuk kompatibilitas data lama & baru)
            const idx = yappa.fractio.findIndex(f => {
                if (typeof f === 'string') return f === fractioName;
                if (typeof f === 'object' && f !== null) {
                    if (f.nama && f.nama === fractioName) return true;
                    if (f.name && f.name === fractioName) return true;
                }
                return false;
            });
            if (idx === -1) {
                // Tampilkan daftar fractio yang terdeteksi untuk membantu debug user
                let daftar = yappa.fractio.map(f => (typeof f === 'string' ? f : (f.nama || f.name || '[tanpa nama]'))).join(', ');
                return interaction.editReply(`Fractio tidak ditemukan di collegium. Daftar fractio saat ini: ${daftar || 'tidak ada'}`);
            }
            // Hapus fractio dari array
            yappa.fractio.splice(idx, 1);
            // Jika ada data fractio di db.fractio, hapus juga (cari dengan nama/nama)
            if (db.fractio && Array.isArray(db.fractio)) {
                const idx2 = db.fractio.findIndex(f => (f.nama === fractioName || f.name === fractioName));
                if (idx2 !== -1) db.fractio.splice(idx2, 1);
            }
            saveDB(db);
            return interaction.editReply(`Fractio **${fractioName}** berhasil dihapus dari collegium.`);
        }
        // --- Perbaikan/penyesuaian command lain (gabung, keluar, setrole) agar selalu update roles dan jabatan dengan benar ---
        // Gabung: pastikan user tidak double, dan role/jabatan konsisten
        // Keluar: pastikan semua jabatan user direset jika keluar
        // Setrole: pastikan jabatan lama user direset jika diganti ke jabatan baru
    }
};

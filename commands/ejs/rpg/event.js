// event.js - Command frontend untuk fitur event RPG Empire Roman
const { EmbedBuilder } = require('discord.js');
const rpgEvent = require('../../../utils/js/rpgEvent');

module.exports = {
    name: 'event',
    description: 'Lihat dan partisipasi event RPG Empire Roman',
    options: [
        {
            name: 'info',
            description: 'Lihat info event aktif',
            type: 1
        },
        {
            name: 'join',
            description: 'Ikut event',
            type: 1
        },
        {
            name: 'c',
            description: 'Buat event baru (admin/mod)',
            type: 1,
            options: [
                { name: 'nama', description: 'Nama event', type: 3, required: true },
                { name: 'deskripsi', description: 'Deskripsi event', type: 3, required: true },
                { name: 'periode', description: 'Periode event', type: 3, required: true }
            ]
        },
        {
            name: 'end',
            description: 'Akhiri event aktif (admin/mod)',
            type: 1
        },
        {
            name: 'list',
            description: 'Lihat daftar event',
            type: 1
        },
        {
            name: 'participants',
            description: 'Lihat peserta event aktif',
            type: 1
        },
        {
            name: 'infodetail',
            description: 'Lihat info event tertentu',
            type: 1,
            options: [
                { name: 'nama', description: 'Nama event', type: 3, required: true }
            ]
        }
    ],
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        if (sub === 'info') {
            const event = rpgEvent.getActiveEvent();
            if (!event) return interaction.editReply({ content: 'Tidak ada event aktif.' });
            const embed = new EmbedBuilder()
                .setTitle('Event Aktif')
                .setColor('#c2b280')
                .setDescription(event.deskripsi)
                .addFields(
                    { name: 'Nama', value: event.nama, inline: true },
                    { name: 'Periode', value: event.periode, inline: true }
                )
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 'join') {
            const result = rpgEvent.joinEvent(userId);
            if (result.success) {
                return interaction.editReply({ content: 'Berhasil ikut event!' });
            } else {
                return interaction.editReply({ content: `Gagal ikut event: ${result.msg}` });
            }
        } else if (sub === 'c') {
            // Buat event baru (admin/mod only, contoh sederhana tanpa validasi role)
            const nama = interaction.options.getString('nama');
            const deskripsi = interaction.options.getString('deskripsi');
            const periode = interaction.options.getString('periode');
            const result = rpgEvent.createEvent(nama, deskripsi, periode, userId);
            if (result.success) {
                return interaction.editReply({ content: `Event baru "${nama}" berhasil dibuat!` });
            } else {
                return interaction.editReply({ content: `Gagal membuat event: ${result.msg}` });
            }
        } else if (sub === 'end') {
            // Akhiri event aktif (admin/mod only)
            const result = rpgEvent.endActiveEvent(userId);
            if (result.success) {
                return interaction.editReply({ content: 'Event aktif telah diakhiri.' });
            } else {
                return interaction.editReply({ content: `Gagal mengakhiri event: ${result.msg}` });
            }
        } else if (sub === 'list') {
            // Daftar semua event
            const events = rpgEvent.getAllEvents();
            if (!events.length) return interaction.editReply({ content: 'Belum ada event.' });
            const embed = new EmbedBuilder()
                .setTitle('Daftar Event')
                .setColor('#c2b280')
                .setDescription(events.map(e => `**${e.nama}** (${e.periode})`).join('\n'))
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 'participants') {
            // Lihat peserta event aktif
            const event = rpgEvent.getActiveEvent();
            if (!event) return interaction.editReply({ content: 'Tidak ada event aktif.' });
            const peserta = event.peserta || [];
            return interaction.editReply({ content: peserta.length ? peserta.map(id => `<@${id}>`).join(', ') : 'Belum ada peserta.' });
        } else if (sub === 'infodetail') {
            // Info event tertentu
            const nama = interaction.options.getString('nama');
            const event = rpgEvent.getEventByName(nama);
            if (!event) return interaction.editReply({ content: 'Event tidak ditemukan.' });
            const embed = new EmbedBuilder()
                .setTitle(`Info Event: ${event.nama}`)
                .setColor('#c2b280')
                .setDescription(event.deskripsi)
                .addFields(
                    { name: 'Periode', value: event.periode, inline: true },
                    { name: 'Peserta', value: (event.peserta || []).length.toString(), inline: true }
                )
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }
    }
};

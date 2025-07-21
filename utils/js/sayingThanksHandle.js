// sayingThanksHandle.js
// Handler ucapan terima kasih saat bot di-invite ke guild baru
const { EmbedBuilder } = require('discord.js');

/**
 * Mengirim ucapan terima kasih ke channel utama/welcome saat bot join guild baru
 * @param {Guild} guild - Discord Guild object
 * @param {Client} client - Discord Client object
 */
async function handleGuildJoin(guild, client) {
    // Cari channel text yang bisa dikirim pesan
    let channel = guild.systemChannel || guild.publicUpdatesChannel || guild.channels.cache.find(
        c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages')
    );
    if (!channel) return;
    try {
        const embed = new EmbedBuilder()
            .setTitle('Terima Kasih Telah Mengundang Empire Yapping!')
            .setColor('#c2b280')
            .setDescription(`Halo, warga **${guild.name}**!\n\nBot Empire Yapping siap menemani petualangan RPG bertema Kekaisaran Romawi di server ini.`)
            .addFields(
                { name: 'Mulai Main', value: 'Gunakan perintah `/startrpg` untuk mendaftar dan memulai petualanganmu!' },
                { name: 'Bantuan', value: 'Gunakan `/help` untuk melihat daftar command dan bantuan.' },
                { name: 'Saran', value: 'Jangan ragu hubungi admin jika ada pertanyaan atau saran.' }
            )
            .setFooter({ text: 'Empire Yapping - Discord RPG Roman Empire' })
            .setTimestamp();
        await channel.send({ embeds: [embed] });
    } catch (e) {
        // Tidak bisa kirim pesan, abaikan
    }
}

module.exports = { handleGuildJoin };

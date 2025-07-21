// custRoleHandler.js
// Handler untuk custom role request dari form web ke Discord
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Simpan data form sementara
defaultFormPath = path.join(__dirname, '../../../data/custRoleForms.json');

function saveFormData(data) {
    fs.mkdirSync(path.dirname(defaultFormPath), { recursive: true });
    fs.writeFileSync(defaultFormPath, JSON.stringify(data, null, 2));
}

function loadFormData() {
    if (!fs.existsSync(defaultFormPath)) return [];
    return JSON.parse(fs.readFileSync(defaultFormPath, 'utf8'));
}

// Fungsi untuk membuat embed dari data form
function makeRoleEmbed(form) {
    const embed = new EmbedBuilder()
        .setTitle('Permintaan Custom Role')
        .addFields(
            { name: 'Nama', value: form.nama, inline: true },
            { name: 'Tipe Warna', value: form.tipe, inline: true },
            { name: 'Icon', value: form.icon ? '[Lihat Icon](' + form.icon + ')' : '-', inline: true }
        )
        .setTimestamp();
    if (form.tipe === 'solid') {
        embed.addFields({ name: 'Warna', value: form.warna1, inline: true });
    } else if (form.tipe === 'gradient') {
        embed.addFields(
            { name: 'Warna 1', value: form.warna1, inline: true },
            { name: 'Warna 2', value: form.warna2, inline: true }
        );
    } else if (form.tipe === 'holographic') {
        embed.addFields({ name: 'Warna', value: 'Holographic (tidak ada pilihan warna)', inline: true });
    }
    return embed;
}

// Fungsi untuk mengirim pesan ke channel custom role
async function sendRoleRequestToChannel(client, channelId, form) {
    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error('Channel tidak ditemukan');
    const embed = makeRoleEmbed(form);
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('approve_custrole').setLabel('Approve').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('decline_custrole').setLabel('Decline').setStyle(ButtonStyle.Danger)
    );
    await channel.send({ embeds: [embed], components: [row] });
}

module.exports = {
    saveFormData,
    loadFormData,
    sendRoleRequestToChannel,
    makeRoleEmbed
};

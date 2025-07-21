// inventory.js - Command frontend untuk fitur inventory RPG Empire Yapping
const rpgInventory = require('../../../utils/js/rpgInventory');

module.exports = {
    name: 'inv',
    description: 'Lihat dan kelola inventory-mu di Empire Yapping',
    options: [
        {
            name: 'use',
            description: 'Gunakan item dari inventory',
            type: 1,
            options: [
                { name: 'item', description: 'Nama item', type: 3, required: true },
                { name: 'jumlah', description: 'Jumlah', type: 4, required: false }
            ]
        },
        {
            name: 'o',
            description: 'Buka inventory dengan gambar grid',
            type: 1
        }
    ],
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false }); // Semua orang bisa lihat
        let sub;
        try {
            sub = interaction.options.getSubcommand();
        } catch (e) {
            sub = null;
        }
        const userId = interaction.user.id;
        if (!sub) {
            // Default: tampilkan list text sederhana (tanpa embed)
            const items = rpgInventory.getInventory(userId);
            const text = items.length ? items.map(i => `- ${i.nama || i} x${i.jumlah || 1}`).join('\n') : 'Inventory kosong.';
            return interaction.editReply({ content: text });
        } else if (sub === 'o') {
            // Tampilkan inventory grid image tanpa embed
            const items = rpgInventory.getInventory(userId);
            const { createInventoryImage } = require('../../../utils/js/inventoryImage');
            const buffer = createInventoryImage(items);
            const { AttachmentBuilder } = require('discord.js');
            const attachment = new AttachmentBuilder(buffer, { name: 'inventory.png' });
            return interaction.editReply({ content: 'Inventory-mu:', files: [attachment] });
        } else if (sub === 'use') {
            const itemName = interaction.options.getString('item');
            const jumlah = interaction.options.getInteger('jumlah') || 1;
            const result = rpgInventory.useItem(userId, itemName, jumlah);
            if (result.success) {
                return interaction.editReply({ content: `Berhasil menggunakan ${jumlah} ${itemName}!` });
            } else {
                return interaction.editReply({ content: `Gagal menggunakan item: ${result.msg}` });
            }
        }
    }
};

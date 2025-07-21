// shop.js - Command frontend untuk fitur shop RPG Empire Yapping
const { EmbedBuilder } = require('discord.js');
const rpgShop = require('../../../utils/js/rpgShop');

module.exports = {
    name: 'shop',
    description: 'Lihat dan beli item di Empire Shop',
    options: [
        {
            name: 'list',
            description: 'Lihat daftar item shop',
            type: 1
        },
        {
            name: 'buy',
            description: 'Beli item dari shop',
            type: 1,
            options: [
                { name: 'item', description: 'Nama item', type: 3, required: true },
                { name: 'jumlah', description: 'Jumlah', type: 4, required: false }
            ]
        }
    ],
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const sub = interaction.options.getSubcommand();
        if (sub === 'list') {
            const items = rpgShop.getShopItems();
            const embed = new EmbedBuilder()
                .setTitle('Empire Shop')
                .setColor('#c2b280')
                .setDescription('Daftar item yang tersedia di Empire Shop:')
                .addFields(items.map(item => ({
                    name: `${item.nama} (${item.harga} gold)` ,
                    value: item.deskripsi || '-',
                    inline: false
                })))
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 'buy') {
            const itemName = interaction.options.getString('item');
            const jumlah = interaction.options.getInteger('jumlah') || 1;
            const userId = interaction.user.id;
            const result = rpgShop.buyItem(userId, itemName, jumlah);
            if (result.success) {
                return interaction.editReply({ content: `Berhasil membeli ${jumlah} ${itemName}!` });
            } else {
                return interaction.editReply({ content: `Gagal membeli item: ${result.msg}` });
            }
        }
    }
};

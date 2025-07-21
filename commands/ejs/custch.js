// commands/ejs/custch.js
// Command untuk mengatur channel custom role dan menerima request dari web
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { sendRoleRequestToChannel } = require('../../utils/js/custRoleHandler');

const configPath = path.join(__dirname, '../../data/custRoleConfig.json');

function saveConfig(data) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

function loadConfig() {
    if (!fs.existsSync(configPath)) return {};
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('custch')
        .setDescription('Set channel untuk custom role request')
        .addChannelOption(opt =>
            opt.setName('channel')
                .setDescription('Channel tujuan')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const config = loadConfig();
        config.channelId = channel.id;
        saveConfig(config);
        await interaction.reply({ content: `Channel custom role diatur ke <#${channel.id}>`, ephemeral: true });
    },
    // Handler untuk menerima request dari web (simulasi, bisa dipanggil dari endpoint express)
    async handleWebForm(client, form) {
        const config = loadConfig();
        if (!config.channelId) throw new Error('Channel custom role belum diatur!');
        await sendRoleRequestToChannel(client, config.channelId, form);
    }
};

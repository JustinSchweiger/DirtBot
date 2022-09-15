const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../helper/Logger');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup important channels for the bot.')
        .addChannelOption(
            option => option
                .setName('log-channel')
                .setDescription('The channel in which to post logs.')
                .setRequired(true),
        ),
    async execute(interaction) {
        const logChannel = interaction.options.getChannel('log-channel');
        const logChannelId = logChannel.id;
        fs.writeFileSync(path.join(__dirname, '..', 'config', 'log-channel.json'), JSON.stringify(logChannelId, null, 2));
        await Logger.log(`${interaction.user} has set the log channel to ${logChannel}.`, Logger.level.info);
        await interaction.reply({ content: `Log channel set to ${logChannel}.`, ephemeral: true });
    },
};
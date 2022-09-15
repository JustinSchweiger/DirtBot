const { EmbedBuilder } = require('discord.js');
const { Client } = require('../../index');

module.exports.Logger = {
    /**
     * Logs a message to the bot-log channel.
     * @param message {string} The message to log.
     * @param level {string} The level of the log.
     * @returns {Promise<void>}
     */
    async log(message, level) {
        const logChannelId = require('../config/channels.json')['botLogChannel'];
        const logChannel = await Client.channels.fetch(logChannelId);
        let color = '';
        if (level === 'INFO') {
            color = '#00a1cb';
        } else if (level === 'WARNING') {
            color = '#ffff00';
        } else if (level === 'ERROR') {
            color = '#df0000';
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setDescription(message);
        await logChannel.send({ embeds: [embed] });
    },
    /**
     * Logs an embed to the bot-log channel.
     * @param embed {EmbedBuilder} The embed to log.
     * @returns {Promise<void>}
     */
    async logEmbed(embed) {
        const logChannelId = require('../config/channels.json')['botLogChannel'];
        const logChannel = await Client.channels.fetch(logChannelId);
        await logChannel.send({ embeds: [embed] });
    },
};

module.exports.Level = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
};
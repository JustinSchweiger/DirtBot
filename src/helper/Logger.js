const { EmbedBuilder } = require('discord.js');
const { Client } = require('../../index');

module.exports.Logger = {
    async log(message, level) {
        const logChannelId = require('../config/log-channel.json');
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
};

module.exports.Level = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
};
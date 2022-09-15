const { EmbedBuilder } = require('discord.js');
const { Client } = require('../../index');

module.exports = {
    level: {
        info: 'Info',
        warning: 'Warning',
        error: 'Error',
    },
    async log(message, level) {
        const logChannelId = require('../config/log-channel.json');
        const logChannel = await Client.channels.fetch(logChannelId);
        let color = '';
        if (level === this.level.info) {
            color = '#00a1cb';
        } else if (level === this.level.warning) {
            color = '#ffff00';
        } else if (level === this.level.error) {
            color = '#df0000';
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setDescription(message);
        await logChannel.send({ embeds: [embed] });
    },
};
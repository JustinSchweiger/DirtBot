import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Client } from '../../index.js';

export const Level = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
};

export class Logger {
    /**
     * Logs a message to the bot-log channel.
     * @param message {string} The message to log.
     * @param level {string} The level of the log.
     * @returns {Promise<void>}
     */
    static async log(message, level) {
        let logChannelId;
        try {
            logChannelId = JSON.parse(readFileSync(resolve('src/config/channels.json')))['botLogChannel'];
        } catch (err) {
            console.log('Channels not yet set up!');
            return;
        }
        const logChannel = await Client.channels.fetch(logChannelId);
        let color = '';
        if (level === Level.INFO) {
            color = '#00a1cb';
        } else if (level === Level.WARNING) {
            color = '#ffff00';
        } else if (level === Level.ERROR) {
            color = '#df0000';
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setDescription(message);
        await logChannel.send({ embeds: [embed] });
    }

    /**
     * Logs an embed to the bot-log channel.
     * @param embed {EmbedBuilder} The embed to log.
     * @returns {Promise<void>}
     */
    static async logEmbed(embed) {
        let logChannelId;
        try {
            logChannelId = JSON.parse(readFileSync(resolve('src/config/channels.json')))['botLogChannel'];
        } catch (err) {
            console.log('Channels not yet set up!');
            return;
        }
        const logChannel = await Client.channels.fetch(logChannelId);
        await logChannel.send({ embeds: [embed] });
    }
}
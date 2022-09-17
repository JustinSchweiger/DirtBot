import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Client } from '../../index.js';

export class Clear {
    static async channel(channelId) {
        const channel = await Client.channels.fetch(channelId);
        while (channel.messages.cache.size > 0) {
            await channel.bulkDelete(channel.messages.cache);
        }
    }

    static async importantChannels() {
        const channelIds = JSON.parse(readFileSync(resolve('./src/config/channels.json')).toString());
        for (const channelId of Object.values(channelIds)) {
            const channel = await Client.channels.fetch(channelId);
            const messages = await channel.messages.fetch({ limit: 10 });
            channel.bulkDelete(messages);
        }
    }
}
import { Client } from '../../index.js';

export class Clear {
    static async channel(channelId) {
        const channel = await Client.channels.fetch(channelId);
        await channel.messages.fetch({ limit: 1 }).then(messages => {
            channel.bulkDelete(messages);
        });
    }

    static async channels(channelIds) {
        channelIds.map(async channelId => {
            await Clear.channel(channelId);
        });
    }
}
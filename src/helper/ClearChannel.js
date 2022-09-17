const { readFileSync } = require('fs');
const path = require('path');
const { Client } = require('../../index');

module.exports.Clear = {
    async channel(channelId) {
        const channel = await Client.channels.fetch(channelId);
        while (channel.messages.cache.size > 0) {
            await channel.bulkDelete(channel.messages.cache);
        }
    },
    async importantChannels() {
        const channelIds = JSON.parse(readFileSync(path.join(__dirname, '..', 'config', 'channels.json')).toString());
        for (const channelId of Object.values(channelIds)) {
            const channel = await Client.channels.fetch(channelId);
            const messages = await channel.messages.fetch({ limit: 10 });
            channel.bulkDelete(messages);
        }
    },
};
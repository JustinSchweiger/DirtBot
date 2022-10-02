import ips from '../slash-commands/ips.js';
import store from '../slash-commands/store.js';
import vote from '../slash-commands/vote.js';

export default {
    extra: {
        hidden: true,
    },
    async InfoEmbeds() {
        const embeds = [];
        embeds.push(
            ...await ips.getEmbeds(),
            await vote.getEmbed(),
            await store.getEmbed(),
        );

        return embeds;
    },
};
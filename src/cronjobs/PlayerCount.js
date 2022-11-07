import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import { resolve } from 'path';
import { Client } from '../../index.js';
import { File } from '../helper/GetFileFromGitlab.js';

export default {
    time: '0 */10 * * * *',
    async run() {
        const channelIds = JSON.parse(readFileSync(resolve('./src/config/channels.json')).toString());

        if (!channelIds['playerCountChannel']) return;

        const playerCountChannel = await Client.channels.fetch(channelIds['playerCountChannel']).catch(() => null);

        if (!playerCountChannel) return;

        const playerCountUrls = JSON.parse(await File.get('playercount-urls.json'));
        let count = 0;
        for (const url of playerCountUrls) {
            const playerCount = await fetch(`https://mcapi.us/server/status?ip=${url}`).then(res => res.json());
            count += playerCount.players ? playerCount.players.now : 0;
        }

        playerCountChannel.setName(`Players Online: ${count}`);
    },
};
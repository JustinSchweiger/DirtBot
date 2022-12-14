import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { GitLabFile } from '../../helper/EnsureFileSync.js';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ips')
        .setDescription('Shows the ips of all our servers.'),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async getEmbeds() {
        await GitLabFile.serve('servers.json');
        const serversPath = resolve('./assets/servers.json');

        const serversJson = JSON.parse(readFileSync(serversPath).toString());
        const stats = statSync(serversPath);
        const date = new Date(stats.mtime);

        const pixel = [
            {
                name: '__Pixelmon Server__',
                value: serversJson
                    .filter(server => server['isPixelmon'])
                    .map(server => server['new'] ? `:new: ${server['server']}` : server['server'])
                    .join('\n'),
                inline: true,
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: true,
            },
            {
                name: '__Server IPs__',
                value: serversJson
                    .filter(server => server['isPixelmon'])
                    .map(server => server['ip'])
                    .join('\n'),
                inline: true,
            },
        ];

        const modpack = [
            {
                name: '__Modpack__',
                value: serversJson
                    .filter(server => !server['isPixelmon'])
                    .map(server => server['new'] ? `:new: ${server['server']}` : server['server'])
                    .join('\n'),
                inline: true,
            },
            {
                name: '__Server IP__',
                value: serversJson
                    .filter(server => !server['isPixelmon'])
                    .map(server => server['ip'])
                    .join('\n'),
                inline: true,
            },
        ];

        const extra = await Extra.get();

        return [
            new EmbedBuilder()
                .setColor('#df0000')
                .setTitle(`${extra['bulletpoint']} DirtCraft Pixelmon Server IPs ${extra['bulletpoint']}`)
                .addFields(pixel)
                .setImage(extra['pixel-banner'])
                .setFooter({ text: 'Last Updated ', iconURL: extra['footer-icon'] })
                .setTimestamp(date),
            new EmbedBuilder()
                .setColor('#df0000')
                .setTitle(`${extra['bulletpoint']} DirtCraft Modpack Server IPs ${extra['bulletpoint']}`)
                .addFields(modpack)
                .setImage(extra['modpack-banner'])
                .setFooter({ text: 'Last Updated ', iconURL: extra['footer-icon'] })
                .setTimestamp(date),
            new EmbedBuilder()
                .setColor('#df0000')
                .setTitle(`${extra['bulletpoint']} DirtCraft Hub${extra['bulletpoint']}`)
                .setDescription('You can connect to the hub by using the IP `dirtcraft.gg` or `pixelmon.gg`.\nFrom there you can connect to all of our `1.7.10`, `1.10.2` and `1.12.2` servers!\n \nThere is currently no hub for our `1.16.5` servers!\nPlease use the direct ip for now!')
                .setFooter({ text: 'Last Updated ', iconURL: extra['footer-icon'] })
                .setTimestamp(date),
        ];
    },
    async execute(interaction) {
        interaction.reply({
            embeds: [
                ...await this.getEmbeds(),
            ],
        });
    },
};
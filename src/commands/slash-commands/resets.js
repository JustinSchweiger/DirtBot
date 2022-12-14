import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { GitLabFile } from '../../helper/EnsureFileSync.js';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('resets')
        .setDescription('Shows when our servers were last reset.'),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async execute(interaction) {
        await GitLabFile.serve('servers.json');
        const serversPath = resolve('./assets/servers.json');

        const serversJson = JSON.parse(readFileSync(serversPath).toString()).sort((a, b) => {
            return new Date(b['last-wiped']) - new Date(a['last-wiped']);
        });
        const stats = statSync(serversPath);
        const date = new Date(stats.mtime);

        const resets = [
            {
                name: '__Modpack__',
                value: serversJson
                    .map(server => server['version-name'])
                    .join('\n'),
                inline: true,
            },
            {
                name: '__Last Reset__',
                value: serversJson
                    .map(server => server['last-wiped'])
                    .join('\n'),
                inline: true,
            },
        ];

        const extra = await Extra.get();

        const modpackEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Server Resets ${extra['bulletpoint']}`)
            .addFields(resets)
            .setFooter({ text: 'Last Updated ', iconURL: extra['footer-icon'] })
            .setTimestamp(date);

        interaction.reply({ embeds: [modpackEmbed] });
    },
};
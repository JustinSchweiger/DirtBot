import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { GitLabFile } from '../../helper/EnsureFileSync.js';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('versions')
        .setDescription('Shows the versions of all our servers.'),
    extra: {
        hidden: false,
    },
    async execute(interaction) {
        await GitLabFile.serve('servers.json');
        const serversPath = resolve('./assets/servers.json');

        const serversJson = JSON.parse(readFileSync(serversPath).toString());
        const stats = statSync(serversPath);
        const date = new Date(stats.mtime);

        const versions = [
            {
                name: '__Modpack__',
                value: serversJson
                    .map(server => server['new'] ? `:new: ${server['version-name']}` : server['version-name'])
                    .join('\n'),
                inline: true,
            },
            {
                name: '__MC-Version__',
                value: serversJson
                    .map(server => server['mc-version'])
                    .join('\n'),
                inline: true,
            },
            {
                name: '__Version__',
                value: `**${serversJson
                    .map(server => server['modpack-version'])
                    .join('\n')
                }**`,
                inline: true,
            },
        ];

        const extra = await Extra.get();

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Modpack Versions ${extra['bulletpoint']}`)
            .addFields(versions)
            .setFooter({ text: 'Last Update ', iconURL: extra['footer-icon'] })
            .setTimestamp(date);

        interaction.reply({ embeds: [embed] });
    },
};
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { File } = require('../helper/GetFileFromGitlab');
const { readFileSync, statSync } = require('fs');
const { Logger, Level } = require('../helper/Logger');
const path = require('path');
const { GitLabFile } = require('../helper/EnsureFileSync');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('versions')
        .setDescription('Shows the versions of all our servers.'),
    execute: async function(interaction) {
        await GitLabFile.serve(interaction, 'servers.json');
        const serversPath = path.join(__dirname, '..', '..', 'assets', 'servers.json');

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

        let extra;

        try {
            extra = JSON.parse(await File.get('extra.json'));
        } catch (err) {
            await Logger.log('Error fetching extra.json', Level.ERROR);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Modpack Versions ${extra['bulletpoint']}`)
            .addFields(versions)
            .setFooter({ text: 'Last Update ', iconURL: extra['footer-icon'] })
            .setTimestamp(date);

        interaction.reply({ embeds: [embed] });
    },
};
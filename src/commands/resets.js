const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { File } = require('../helper/GetFileFromGitlab');
const { Logger, Level } = require('../helper/Logger');
const { readFileSync, statSync } = require('fs');
const path = require('path');
const { GitLabFile } = require('../helper/EnsureFileSync');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resets')
        .setDescription('Shows when our servers were last reset.'),
    extra: {
        hidden: false,
    },
    async execute(interaction) {
        await GitLabFile.serve(interaction, 'servers.json');
        const serversPath = path.join(__dirname, '..', '..', 'assets', 'servers.json');

        const serversJson = JSON.parse(readFileSync(serversPath).toString());
        const stats = statSync(serversPath);
        const date = new Date(stats.mtime);

        const resets = [
            {
                name: '__Modpack__',
                value: serversJson
                    .map(server => server['server'])
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

        let extra;
        try {
            extra = JSON.parse(await File.get('extra.json'));
        } catch (err) {
            await Logger.log('Error fetching extra.json', Level.ERROR);
            return;
        }

        const modpackEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Server Resets ${extra['bulletpoint']}`)
            .addFields(resets)
            .setFooter({ text: 'Last Updated ', iconURL: extra['footer-icon'] })
            .setTimestamp(date);

        interaction.reply({ embeds: [modpackEmbed] });
    },
};
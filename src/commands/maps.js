const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { File } = require('../helper/GetFileFromGitlab');
const { readFileSync, statSync } = require('fs');
const { Logger, Level } = require('../helper/Logger');
const path = require('path');
const { GitLabFile } = require('../helper/EnsureFileSync');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('maps')
        .setDescription('Shows a list of old maps that can be downloaded.'),
    extra: {
        hidden: false,
    },
    async execute(interaction) {
        await GitLabFile.serve(interaction, 'maps.json');
        const mapsPath = path.join(__dirname, '..', '..', 'assets', 'maps.json');

        const mapsJson = JSON.parse(readFileSync(mapsPath).toString());
        const stats = statSync(mapsPath);
        const date = new Date(stats.mtime);

        const maps = [
            {
                name: '__Modpack__',
                value: mapsJson
                    .map(map => `[**${map['server']}**](${map['link']})`)
                    .join('\n'),
                inline: true,
            },
            {
                name: '__Date__',
                value: mapsJson
                    .map(map => map['date'])
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

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Old Maps ${extra['bulletpoint']}`)
            .addFields(maps)
            .setFooter({ text: 'Last Update ', iconURL: extra['footer-icon'] })
            .setTimestamp(date);

        interaction.reply({ embeds: [embed] });
    },
};
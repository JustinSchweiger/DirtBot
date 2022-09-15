const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { File } = require('../helper/GetFileFromGitlab');
const { readFileSync, statSync } = require('fs');
const { Logger, Level } = require('../helper/Logger');
const path = require('path');
const { GitLabFile } = require('../helper/EnsureFileSync');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Shows the vote links.'),
    execute: async function(interaction) {
        await GitLabFile.serve(interaction, 'vote.json');
        const votePath = path.join(__dirname, '..', '..', 'assets', 'vote.json');

        const voteJson = JSON.parse(readFileSync(votePath).toString());
        const stats = statSync(votePath);
        const date = new Date(stats.mtime);

        const voting = [
            {
                name: '__Vote Links__',
                value: voteJson
                    .map(vote => `[**Click me to vote on ${vote['site']}**](${vote['link']} 'Click to open the voting page.')`)
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
            .setTitle(`${extra['bulletpoint']} DirtCraft Vote Links ${extra['bulletpoint']}`)
            .addFields(voting)
            .setFooter({ text: 'Last Update ', iconURL: extra['footer-icon'] })
            .setTimestamp(date);

        interaction.reply({ embeds: [embed] });
    },
};
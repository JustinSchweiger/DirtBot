import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { GitLabFile } from '../../helper/EnsureFileSync.js';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Shows the vote links.'),
    extra: {
        hidden: false,
    },
    execute: async function(interaction) {
        await GitLabFile.serve(interaction, 'vote.json');
        const votePath = resolve('./assets/vote.json');

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

        const extra = await Extra.get();

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Vote Links ${extra['bulletpoint']}`)
            .addFields(voting)
            .setFooter({ text: 'Last Update ', iconURL: extra['footer-icon'] })
            .setTimestamp(date);

        interaction.reply({ embeds: [embed] });
    },
};
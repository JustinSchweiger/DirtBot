import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { GitLabFile } from '../../helper/EnsureFileSync.js';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('review')
        .setDescription('Shows the review links.'),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async getEmbed() {
        await GitLabFile.serve('reviews.json');
        const reviews = resolve('./assets/reviews.json');

        const reviewJson = JSON.parse(readFileSync(reviews).toString());
        const stats = statSync(reviews);
        const date = new Date(stats.mtime);

        const extra = await Extra.get();

        return new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${(await Extra.get())['bulletpoint']} DirtCraft Ticket System ${(await Extra.get())['bulletpoint']}`)
            .addFields([
                {
                    name: '__**Review**__',
                    value: 'Please consider leaving a review on your experiences on DirtCraft and the support you have received.\n' +
                        'We appreciate the review and hope you enjoy your time on DirtCraft!',
                    inline: false,
                },
                {
                    name: '\u200b',
                    value: reviewJson
                        .map(review => `[Click me to leave a review on **${review['name']}**](${review['link']})`)
                        .join('\n'),
                    inline: true,
                },
            ]).setFooter({ text: 'Thank you for leaving a review :)', iconURL: extra['footer-icon'] })
            .setTimestamp(date);
    },
    async execute(interaction) {
        interaction.reply({
            embeds: [
                await this.getEmbed(),
            ],
        });
    },
};
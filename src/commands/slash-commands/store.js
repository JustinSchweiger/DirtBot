import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { GitLabFile } from '../../helper/EnsureFileSync.js';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('store')
        .setDescription('Shows the store links.'),
    extra: {
        hidden: false,
    },
    async getEmbed() {
        await GitLabFile.serve('stores.json');
        const stores = JSON.parse(readFileSync(resolve('./assets/stores.json')).toString());
        const stats = statSync(resolve('./assets/stores.json'));
        const date = new Date(stats.mtime);

        const extra = await Extra.get();

        return new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Store ${extra['bulletpoint']}`)
            .addFields([
                {
                    name: '__**DirtCraft Stores**__',
                    value: stores.map(store => `[Click me to open the **${store['name']}**](${store['link']})`).join('\n'),
                    inline: false,
                },
            ]).setFooter({ text: 'Last Updated ', iconURL: extra['footer-icon'] })
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
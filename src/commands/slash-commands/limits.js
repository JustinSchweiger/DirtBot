import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('limits')
        .setDescription('Prints an info text for limits.'),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async execute(interaction) {
        const extra = await Extra.get();
        const channels = JSON.parse(readFileSync(resolve('./src/config/channels.json')));
        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Limits ${extra['bulletpoint']}`)
            .setDescription('You will encounter a problem with Dirt Limiter when you vein-mine or break limited blocks in a non-standard way.\n' +
                '\n' +
                `Please head to <#${channels.supportChannel}> to get it fixed.\n` +
                '\n' +
                'In the future, try **NOT** to vein-mine, moving wand etc. these blocks.')
            .setFooter({ text: 'Limits exist to keep server-performance stable!', iconURL: extra['footer-icon'] })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
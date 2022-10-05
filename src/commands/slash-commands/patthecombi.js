import { SlashCommandBuilder } from '@discordjs/builders';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('petthecombi')
        .setDescription('Cause everyone wants to pet combi ...'),
    extra: {
        hidden: true,
        inHelp: true,
    },
    async execute(interaction) {
        const extra = await Extra.get();
        await interaction.reply(extra['petthecombi-emoji']);
    },
};
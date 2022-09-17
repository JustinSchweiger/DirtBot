import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
        .setName('petthecombi')
        .setDescription('Cause everyone wants to pet combi ...'),
    extra: {
        hidden: true,
    },
    async execute(interaction) {
        await interaction.reply('<a:petthecombi:1020025249770774631>');
    },
};
import { SlashCommandBuilder } from '@discordjs/builders';
import { Extra } from '../../helper/Extra.js';

export default {
    async getChoices() {
        const pet = [
            {
                name: 'Combi',
                value: 'combi',
            },
            {
                name: 'Justin',
                value: 'justin',
            },
            {
                name: 'Ten',
                value: 'ten',
            },
        ];

        return [
            {
                name: 'pet',
                choices: pet.map(p => {
                    return {
                        name: p['name'],
                        value: p['value'],
                    };
                }),
            },
        ];
    },
    data: new SlashCommandBuilder()
        .setName('pet')
        .setDescription('Pet someone lol ...')
        .addStringOption(
            option => option
                .setName('pet')
                .setDescription('The person to pet.')
                .setRequired(true)
                .addChoices({ name: 'pet', value: 'pet' }),
        ),
    extra: {
        hidden: true,
        inHelp: true,
        hasChoices: true,
    },
    async execute(interaction) {
        const extra = await Extra.get();
        const pet = interaction.options.getString('pet');

        switch (pet) {
            case 'combi':
                await interaction.reply(extra['petthecombi-emoji']);
                break;
            case 'justin':
                await interaction.reply(extra['petthejustin-emoji']);
                break;
            case 'ten':
                await interaction.reply(extra['pettheten-emoji']);
                break;
        }
    },
};
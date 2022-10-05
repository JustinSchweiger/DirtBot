import { ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import DenyApplicationModal from './deny-application-modal.js';

export default {
    extra: {
        hidden: false,
        inHelp: false,
    },
    GetButton() {
        return new ButtonBuilder()
            .setCustomId('deny-application')
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger);
    },
    async execute(interaction) {
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));

        if (!interaction.member.roles.cache.get(roles.admin)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#df0000')
                        .setDescription('You do not have permission to Deny this application!'),
                ],
            });
        }

        await DenyApplicationModal.showModal(interaction);
    },
};
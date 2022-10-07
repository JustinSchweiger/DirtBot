import { ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import DenyModal from './deny-modal.js';

export default {
    extra: {
        hidden: false,
        inHelp: false,
    },
    GetButton() {
        return new ButtonBuilder()
            .setCustomId('deny-appeal')
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger);
    },
    async execute(interaction) {
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));

        if (!interaction.member.roles.cache.get(roles.staff)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#df0000')
                        .setDescription('You do not have permission to deny this appeal!'),
                ],
            });
        }

        await DenyModal.showModal(interaction);
    },
};
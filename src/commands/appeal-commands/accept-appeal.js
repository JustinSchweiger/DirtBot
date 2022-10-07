import { ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import AcceptModal from './accept-modal.js';

export default {
    extra: {
        hidden: false,
        inHelp: false,
    },
    GetButton() {
        return new ButtonBuilder()
            .setCustomId('accept-appeal')
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success);
    },
    async execute(interaction) {
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));

        if (!interaction.member.roles.cache.get(roles.staff)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#df0000')
                        .setDescription('You do not have permission to Accept this appeal!'),
                ],
            });
        }

        await AcceptModal.showModal(interaction);
    },
};
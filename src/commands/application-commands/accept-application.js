import { ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import AcceptApplicationModal from './accept-application-modal.js';

export default {
    extra: {
        hidden: false,
        inHelp: false,
    },
    GetButton() {
        return new ButtonBuilder()
                .setCustomId('accept-application')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success);
    },
    async execute(interaction) {
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));

        if (!interaction.member.roles.cache.get(roles.admin)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#df0000')
                        .setDescription('You do not have permission to Accept this application!'),
                ],
            });
        }

        await AcceptApplicationModal.showModal(interaction);
    },
};
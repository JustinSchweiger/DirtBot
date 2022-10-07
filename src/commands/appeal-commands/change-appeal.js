import { ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import ChangeAppealModal from './change-appeal-modal.js';

export default {
    extra: {
        hidden: false,
        inHelp: false,
    },
    GetButton() {
        return new ButtonBuilder()
            .setCustomId('change-appeal')
            .setLabel('Change Appeal')
            .setEmoji('⚙')
            .setStyle(ButtonStyle.Secondary);
    },
    async execute(interaction) {
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));

        if (!interaction.member.roles.cache.get(roles.staff)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#df0000')
                        .setDescription('You do not have permission to change this appeals content!'),
                ],
            });
        }

        await ChangeAppealModal.showModal(interaction);
    },
};
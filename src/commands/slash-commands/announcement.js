import { SlashCommandBuilder } from '@discordjs/builders';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import AnnouncementModal from '../important-channels/announcement-modal.js';

export default {
    data: new SlashCommandBuilder()
        .setName('announcement')
        .setDescription('Sends an announcement to the announcement channel.')
        .setDefaultMemberPermissions(0)
        .addBooleanOption(
            option => option
                .setName('preview')
                .setDescription('Whether the announcement should be sent as a preview.')
                .setRequired(true),
        ).addRoleOption(
            option => option
                .setName('role')
                .setDescription('The role that should be pinged. Roles inside of Embeds dont ping users.')
                .setRequired(false),
        ),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async execute(interaction) {
        const preview = interaction.options.getBoolean('preview');
        const role = interaction.options.getRole('role');

        AnnouncementModal.preview = preview;
        AnnouncementModal.role = role;
        await AnnouncementModal.showModal(interaction);
    },
};
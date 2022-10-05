import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ApplicationManager } from '../../helper/ApplicationManager.js';
import { Extra } from '../../helper/Extra.js';
import { Database } from '../../helper/VerificationDatabase.js';

export default {
    extra: {
        hidden: true,
        inHelp: false,
    },
    async showModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('staff-app-modal')
            .setTitle('DirtCraft Staff Application');

        const username = await Database.getUsername(interaction.user.id);

        const userName = new TextInputBuilder()
            .setCustomId('staff-modal-username')
            .setLabel('What is your Minecraft username?')
            .setPlaceholder('Enter your username. This is autofilled if you are verified.')
            .setValue(username || '')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(16);

        const server = new TextInputBuilder()
            .setCustomId('staff-modal-server')
            .setLabel('What modpack are you applying for?')
            .setPlaceholder('SkyFactory 4, Stoneblock 2, Oceanblock etc.')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(40);

        const age = new TextInputBuilder()
            .setCustomId('staff-modal-age')
            .setLabel('How old are you?')
            .setPlaceholder('How old are you?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(2);

        const why = new TextInputBuilder()
            .setCustomId('staff-modal-why')
            .setLabel('Why do you want to become staff?')
            .setPlaceholder('Why do you want to become staff?\nHow much time can you contribute?')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(400)
            .setRequired(true);

        const experience = new TextInputBuilder()
            .setCustomId('staff-modal-experience')
            .setLabel('Do you have any prior experience?')
            .setPlaceholder('Staff Experience, Mod Experience, etc.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(400);

        modal.addComponents(
            new ActionRowBuilder().addComponents(userName),
            new ActionRowBuilder().addComponents(server),
            new ActionRowBuilder().addComponents(age),
            new ActionRowBuilder().addComponents(why),
            new ActionRowBuilder().addComponents(experience),
        );

        await interaction.showModal(modal);
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const username = interaction.fields.getTextInputValue('staff-modal-username');
        const server = interaction.fields.getTextInputValue('staff-modal-server');
        const age = interaction.fields.getTextInputValue('staff-modal-age');
        const why = interaction.fields.getTextInputValue('staff-modal-why');
        const experience = interaction.fields.getTextInputValue('staff-modal-experience');

        const extra = Extra.get();
        const newChannel = await ApplicationManager.createNewStaffApp(interaction, username, server, age, why, experience);
        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${(await extra)['bulletpoint']} DirtCraft Applications ${(await extra)['bulletpoint']}`)
            .setDescription(`Your application (${newChannel}) has been created! Click **[here](${newChannel.url})** to view it.`)
            .setFooter({ text: 'Please wait while our admins have a look at your application!', iconURL: extra['footer-icon'] })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], ephemeral: true });
    },
};
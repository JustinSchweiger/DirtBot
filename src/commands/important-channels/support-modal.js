import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import { TicketManager } from '../../helper/TicketManager.js';
import { Database } from '../../helper/VerificationDatabase.js';

export default {
    extra: {
        hidden: true,
        inHelp: false,
    },
    async showModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('ticket-modal')
            .setTitle('DirtCraft Ticket System');

        const username = await Database.getUsername(interaction.user.id);

        const userName = new TextInputBuilder()
            .setCustomId('ticket-modal-username')
            .setLabel('Username')
            .setPlaceholder('Enter your username. This is autofilled if you are verified.')
            .setValue(username || '')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(16);

        const shortDescription = new TextInputBuilder()
            .setCustomId('ticket-modal-short-description')
            .setLabel('Short Description')
            .setPlaceholder('Enter a short description of your problem.')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(35);

        const problem = new TextInputBuilder()
            .setCustomId('ticket-modal-problem')
            .setLabel('Problem')
            .setPlaceholder('Describe your problem here.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const actionRowUsername = new ActionRowBuilder().addComponents(userName);
        const actionRowShortDescription = new ActionRowBuilder().addComponents(shortDescription);
        const actionRowProblem = new ActionRowBuilder().addComponents(problem);
        modal.addComponents(actionRowUsername, actionRowShortDescription, actionRowProblem);

        await interaction.showModal(modal);
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const username = interaction.fields.getTextInputValue('ticket-modal-username');
        if (!username.match(/^\w+$/)) {
            await interaction.editReply({ content: 'Please enter a valid username.', ephemeral: true });
            return;
        }
        const shortDescription = interaction.fields.getTextInputValue('ticket-modal-short-description').replaceAll(' ', '-') || undefined;
        const problem = interaction.fields.getTextInputValue('ticket-modal-problem');
        const author = interaction.user;
        const uuid = interaction.member.roles.cache.has(JSON.parse(readFileSync(resolve('./src/config/roles.json')))['verified']) ? await Database.getUuidFromDiscordId(interaction.user.id) : await Database.getUuidFromUsername(username);
        if (!uuid) {
            await interaction.editReply({ content: 'Please enter a valid username.', ephemeral: true });
            return;
        }

        const extra = Extra.get();
        const newChannel = await TicketManager.createNewTicket(interaction, username, problem, author, uuid, shortDescription);
        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${(await extra)['bulletpoint']} DirtCraft Ticket System ${(await extra)['bulletpoint']}`)
            .setDescription(`Your ticket (${newChannel}) has been created! Click **[here](${newChannel.url})** to view it.`)
            .setFooter({ text: 'Thank you for using our ticket system!', iconURL: extra['footer-icon'] })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], ephemeral: true });
    },
};
import { SlashCommandBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import { TicketManager } from '../../helper/TicketManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Sends a reason and closes the ticket after 24 hours.')
        .setDefaultMemberPermissions(0)
        .addStringOption(
            option => option
                .setName('reason')
                .setDescription('The reason for closing the ticket')
                .setRequired(true),
        ),
    async getButtons() {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close-ticket')
                .setStyle(ButtonStyle.Success)
                .setLabel('Close Ticket'),
            new ButtonBuilder()
                .setCustomId('cancel-closure')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Cancel Closure'),
        );
    },
    async getEmbeds(interaction) {
        const extra = await Extra.get();
        return [
            new EmbedBuilder()
                .setColor('#df0000')
                .setTitle(`${extra['bulletpoint']} DirtCraft Ticket System ${extra['bulletpoint']}`)
                .addFields([
                    {
                        name: '__**Ticket Close Timer Set**__',
                        value: 'This Ticket will automatically be closed in **24 hours**.' +
                            '\n ' +
                            '\nTo **close it now**, click the 🟩 button below.' +
                            '\nTo **cancel closure**, click the 🟥 button below.' +
                            '\n ',
                        inline: false,
                    },
                    {
                        name: '__**Reason**__',
                        value: '```' + interaction.options.getString('reason') + '```',
                        inline: false,
                    },
                ]).setFooter({ text: 'Thank you for using our ticket system!', iconURL: extra['footer-icon'] })
                .setTimestamp(),
        ];
    },
    extra: {
        hidden: false,
        inHelp: true,
        ticketCommand: true,
    },
    async execute(interaction) {
        if (!await TicketManager.hasPermsAndIsTicket(interaction, false)) return;

        const channel = interaction.guild.channels.cache.get(interaction.channel.id);

        if (!interaction.customId) {
            await interaction.reply({
                embeds: [...await this.getEmbeds(interaction)],
                components: [await this.getButtons()],
            });

            await TicketManager.prepareCloseTicket(channel, interaction.member.user, interaction.options.getString('reason'));
            return;
        }

        if (interaction.customId === 'cancel-closure') {
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#df0000')
                        .setTitle(`${(await Extra.get())['bulletpoint']} DirtCraft Ticket System ${(await Extra.get())['bulletpoint']}`)
                        .addFields([
                            {
                                name: '__**Ticket Closure Cancelled**__',
                                value: `${interaction.member.user} has **cancelled** the ticket closure.`,
                                inline: false,
                            },
                        ])
                        .setFooter({
                            text: 'Thank you for using our ticket system!',
                            iconURL: (await Extra.get())['footer-icon'],
                        })
                        .setTimestamp(),
                ],
                components: [],
            });
            await TicketManager.cancelTicketClosure(channel, interaction.member.user);
            return;
        }

        if (interaction.customId === 'close-ticket') {
            await interaction.deferUpdate();
            await TicketManager.closeTicket(channel);
        }
    },
};
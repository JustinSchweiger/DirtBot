import { SlashCommandBuilder } from '@discordjs/builders';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TicketManager } from '../../helper/manager/TicketManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Changes the level of a ticket.')
        .setDefaultMemberPermissions(0)
        .addStringOption(
            option => option
                .setName('level')
                .setDescription('The level to set the ticket to.')
                .addChoices(
                    {
                        name: 'Staff',
                        value: 'staff',
                    },
                    {
                        name: 'Admin',
                        value: 'admin',
                    },
                    {
                        name: 'Network Admin',
                        value: 'networkadmin',
                    },
                    {
                        name: 'Manager',
                        value: 'manager',
                    },
                    {
                        name: 'Owner',
                        value: 'owner',
                    },
                ).setRequired(true),
        ).addBooleanOption(
            option => option
                .setName('ping')
                .setDescription('Whether to ping the appropriate staff role.')
                .setRequired(false),
        ),
    extra: {
        hidden: false,
        inHelp: true,
        ticketCommand: true,
    },
    async execute(interaction) {
        if (!await TicketManager.hasPermsAndIsTicket(interaction, false)) return;

        const channel = interaction.guild.channels.cache.get(interaction.channel.id);
        const choice = interaction.options.getString('level');
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));
        const ping = interaction.options.getBoolean('ping') ?? true;

        switch (choice) {
            case 'staff':
                await TicketManager.changeLevel(channel, interaction.member.user, roles.staff, 'staff', interaction, ping);
                break;
            case 'admin':
                await TicketManager.changeLevel(channel, interaction.member.user, roles.admin, 'admin', interaction, ping);
                break;
            case 'networkadmin':
                await TicketManager.changeLevel(channel, interaction.member.user, roles.networkAdmin, 'networkadmin', interaction, ping);
                break;
            case 'manager':
                await TicketManager.changeLevel(channel, interaction.member.user, roles.manager, 'manager', interaction, ping);
                break;
            case 'owner':
                await TicketManager.changeLevel(channel, interaction.member.user, roles.owner, 'owner', interaction, ping);
                break;
        }
    },
};
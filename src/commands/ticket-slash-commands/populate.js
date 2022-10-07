import { SlashCommandBuilder } from '@discordjs/builders';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { File } from '../../helper/GetFileFromGitlab.js';
import { TicketManager } from '../../helper/manager/TicketManager.js';
import { Minecraft } from '../../helper/Minecraft.js';

export default {
    async getChoices() {
        return [
            {
                name: 'server',
                choices: JSON.parse(await File.get('ticket-notifications.json')).map(ticketNotification => {
                    return {
                        name: ticketNotification['name'],
                        value: ticketNotification['short'],
                    };
                }),
            },
        ];
    },
    data: new SlashCommandBuilder()
        .setName('populate')
        .setDescription('Changes the server, username and name of a ticket.')
        .setDefaultMemberPermissions(0)
        .addStringOption(
            option => option
                .setName('server')
                .setDescription('The server to change to.')
                .setRequired(true)
                .addChoices({ name: 'server', value: 'server' }),
        ).addStringOption(
            option => option
                .setName('username')
                .setDescription('The username to change to.')
                .setRequired(true),
        ).addStringOption(
            option => option
                .setName('rename')
                .setDescription('The new name of the ticket. You dont have to add the ticket number!')
                .setRequired(false),
        ),
    extra: {
        hidden: false,
        hasChoices: true,
        inHelp: true,
        ticketCommand: true,
    },
    async execute(interaction) {
        if (!await TicketManager.hasPermsAndIsTicket(interaction, false)) return;

        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${interaction.channel.id}.json`)));
        const channel = interaction.guild.channels.cache.get(interaction.channel.id);

        const newServer = interaction.options.getString('server');
        const newTicketName = interaction.options.getString('rename') ? interaction.options.getString('rename').replaceAll(' ', '-') + '-' + ticket.ticketId : undefined;
        const newUsername = interaction.options.getString('username');

        const uuid = await Minecraft.getUUID(newUsername);

        if (!uuid) {
            await interaction.reply({ content: 'The username you entered is invalid!', ephemeral: true });
            return;
        }

        const notifications = JSON.parse(readFileSync(resolve(`./ticket-notifications/${newServer}.json`)));
        await interaction.reply(notifications.map(notification => `<@${notification}>`).join(' ') || 'No one is subscribed to this server :(');

        if (newTicketName) {
            await interaction.followUp({ content: `Changed username to \`${newUsername}\`!\nRenamed ticket to \`${newTicketName}\`!`, ephemeral: true });
        } else {
            await interaction.followUp({ content: `Changed username to \`${newUsername}\`!`, ephemeral: true });
        }

        await TicketManager.populateTicket(newServer, newTicketName, newUsername, uuid.uuid, channel, interaction.member.user);
    },
};
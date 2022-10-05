import { SlashCommandBuilder } from '@discordjs/builders';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { File } from '../../helper/GetFileFromGitlab.js';
import { TicketManager } from '../../helper/TicketManager.js';

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
        .setName('server')
        .setDescription('Changes the server of a ticket.')
        .addStringOption(
            option => option
                .setName('server')
                .setDescription('The server to change to.')
                .setRequired(true)
                .addChoices({ name: 'server', value: 'server' }),
        ),
    extra: {
        hidden: false,
        hasChoices: true,
        inHelp: true,
        ticketCommand: true,
    },
    async execute(interaction) {
        if (!await TicketManager.hasPermsAndIsTicket(interaction, false)) return;

        const newServer = interaction.options.getString('server');

        const notifications = JSON.parse(readFileSync(resolve(`./ticket-notifications/${newServer}.json`)));
        await interaction.reply(notifications.map(notification => `<@${notification}>`).join(' ') || '```There is no staff this server :(```');

        const channel = interaction.guild.channels.cache.get(interaction.channel.id);

        await TicketManager.changeServer(newServer, channel, interaction.member.user);
    },
};
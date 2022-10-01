import { SlashCommandBuilder } from '@discordjs/builders';
import { readdirSync, readFileSync } from 'fs';
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
    },
    async execute(interaction) {
        const openTickets = readdirSync(resolve('./tickets'));
        if (!openTickets.includes(interaction.channel.id + '.json')) {
            await interaction.reply('This command can only be run in a ticket channel.');
            return;
        }

        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));
        if (!interaction.member.roles.cache.has(roles['staff'])) {
            await interaction.reply('You do not have permission to run this command.');
            return;
        }

        const newServer = interaction.options.getString('server');

        const notifications = JSON.parse(readFileSync(resolve(`./ticket-notifications/${newServer}.json`)));
        await interaction.reply(notifications.map(notification => `<@${notification}>`).join(' ') || '```There is no staff this server :(```');

        const channel = interaction.guild.channels.cache.get(interaction.channel.id);

        await TicketManager.changeServer(newServer, channel, interaction.member.user);
    },
};
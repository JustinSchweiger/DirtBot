import { SlashCommandBuilder } from '@discordjs/builders';
import { File } from '../../helper/GetFileFromGitlab.js';

export default {
    async getChoices() {
        return [
            {
                name: 'notification',
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
        .setName('notifications')
        .setDescription('Lists, adds, or removes ticket notifications.')
        .addSubcommand(
            subcommand => subcommand
                .setName('list')
                .setDescription('Lists all ticket notifications of a user.')
                .addUserOption(option => option.setName('target').setDescription('The user to list ticket notifications for.').setRequired(true)),
        ).addSubcommand(
            subcommand => subcommand
                .setName('add')
                .setDescription('Adds a ticket notification for a user.')
                .addUserOption(
                    option => option
                        .setName('target')
                        .setDescription('The user to add a ticket notification for.')
                        .setRequired(true),
                ).addStringOption(
                    option => option
                        .setName('notification')
                        .setDescription('The notification to add.')
                        .setRequired(true)
                        .addChoices({ name: 'notification', value: 'notification' }),
                ),
        ).addSubcommand(
            subcommand => subcommand
                .setName('remove')
                .setDescription('Removes a ticket notification from a user.')
                .addUserOption(
                    option => option
                        .setName('target')
                        .setDescription('The user to remove a ticket notification from.')
                        .setRequired(true),
                ).addStringOption(
                    option => option
                        .setName('notification')
                        .setDescription('The notification to remove.')
                        .setRequired(true)
                        .addChoices({ name: 'notification', value: 'notification' }),
                ),
        ),
    extra: {
        hidden: false,
        hasChoices: true,
    },
    async execute(interaction) {
        console.log(interaction.options);
    },
};
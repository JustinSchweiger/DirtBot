module.exports.RegisterExtraCommands = {
    async ticketNotifications() {
        const { File } = require('./GetFileFromGitlab');
        const TickedNotifications = require('../commands/important-channels/ticket-notifications');
        const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));
        const { Client } = require('../../index');
        ticketNotifications.map(ticketNotification => {
            Client.commands.set(`ticket-notification-${ticketNotification['short']}`, TickedNotifications);
        });
    },
};
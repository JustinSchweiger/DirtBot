const { Client } = require('../../index');
const { readFileSync } = require('fs');
const path = require('path');
const { File } = require('./GetFileFromGitlab');
const { Clear } = require('./ClearChannel');
const TickedNotifications = require('../commands/important-channels/ticket-notifications');

module.exports.Setup = {
    async importantChannels() {
        await Clear.importantChannels();
        const channelIds = JSON.parse(readFileSync(path.join(__dirname, '..', 'config', 'channels.json')).toString());

        const ticketNotificationChannel = await Client.channels.fetch(channelIds['ticketNotificationsChannel']);
        const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));
        ticketNotifications.map(ticketNotification => {
            Client.commands.set(`ticket-notification-${ticketNotification['short']}`, TickedNotifications);
        });
        const ticketNotification = await TickedNotifications.TicketNotificationsButtons(ticketNotifications);
        const ticketNotificationEmbed = await TickedNotifications.TicketNotificationsEmbed();
        ticketNotificationChannel.send({ content: '', embeds: [ticketNotificationEmbed], components: [...ticketNotification] });
    },
};
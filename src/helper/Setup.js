import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Client } from '../../index.js';
import TickedNotifications from '../commands/important-channels/ticket-notifications.js';
import { Clear } from './ClearChannel.js';
import { File } from './GetFileFromGitlab.js';

export class Setup {
    static async importantChannels() {
        await Clear.importantChannels();
        const channelIds = JSON.parse(readFileSync(resolve('./src/config/channels.json')).toString());

        const ticketNotificationChannel = await Client.channels.fetch(channelIds['ticketNotificationsChannel']);
        const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));
        ticketNotifications.map(ticketNotification => {
            Client.commands.set(`ticket-notification-${ticketNotification['short']}`, TickedNotifications);
        });
        const ticketNotification = await TickedNotifications.TicketNotificationsButtons(ticketNotifications);
        const ticketNotificationEmbed = await TickedNotifications.TicketNotificationsEmbed();
        ticketNotificationChannel.send({
            content: '',
            embeds: [ticketNotificationEmbed],
            components: [...ticketNotification],
        });
    }
}
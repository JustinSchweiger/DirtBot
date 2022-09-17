import { Client } from '../../index.js';
import TickedNotifications from '../commands/important-channels/ticket-notifications.js';
import { File } from './GetFileFromGitlab.js';

export class RegisterExtraCommands {
    static async ticketNotifications() {
        const ticketNotificationsJson = JSON.parse(await File.get('ticket-notifications.json'));
        ticketNotificationsJson.map(ticketNotification => {
            Client.commands.set(`ticket-notification-${ticketNotification['short']}`, TickedNotifications);
        });
    }
}
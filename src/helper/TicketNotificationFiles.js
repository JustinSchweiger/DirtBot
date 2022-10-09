import { existsSync, readdirSync, unlinkSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { File } from './GetFileFromGitlab.js';

export class TicketNotificationFiles {
    static async serve() {
        const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));
        for (const notification of ticketNotifications) {
            const filePath = resolve(`./ticket-notifications/${notification['short']}.json`);

            if (existsSync(filePath)) continue;
            writeFileSync(filePath, JSON.stringify([], null, 2));
        }

        const shorts = ticketNotifications.map(notification => notification['short']);
        const files = readdirSync(resolve('./ticket-notifications/')).filter(file => !file.startsWith('.gitkeep'));
        for (const file of files) {
            if (!shorts.includes(file.replace('.json', ''))) {
                unlinkSync(resolve('./ticket-notifications/', file));
            }
        }
    }
}
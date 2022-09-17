const { existsSync, writeFileSync, readdirSync, unlinkSync } = require('fs');
const path = require('path');

module.exports.TicketNotificationFiles = {
    async serve(ticketNotifications) {
        for (const notification of ticketNotifications) {
            const filePath = path.join(__dirname, '..', '..', 'ticket-notifications', `${notification['short']}.json`);

            if (existsSync(filePath)) continue;
            writeFileSync(filePath, JSON.stringify([], null, 2));
        }

        const shorts = ticketNotifications.map(notification => notification['short']);
        const files = readdirSync(path.join(__dirname, '..', '..', 'ticket-notifications')).filter(file => !file.startsWith('.gitkeep'));
        for (const file of files) {
            if (!shorts.includes(file.replace('.json', ''))) {
                unlinkSync(path.join(__dirname, '..', '..', 'ticket-notifications', file));
            }
        }
    },
};
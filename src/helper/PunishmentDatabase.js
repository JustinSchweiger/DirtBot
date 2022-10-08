import mysql from 'mysql2/promise';
import { Level, Logger } from './Logger.js';

export class Database {
    static async connect() {
        let conn = undefined;
        try {
            conn = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.PUNISHMENT_DATABASE,
            });
        } catch (err) {
            await Logger.log('The punishment database can\'t be reached!', Level.ERROR);
        }

        return conn;
    }

    static async getPunishmentData(uuid, type) {
        const connection = await this.connect();
        if (!connection) return undefined;

        let result;

        if (type === 'ban') {
            [result] = await connection.execute('SELECT reason, banned_by_uuid, banned_by_name, time, until FROM litebans_bans WHERE uuid = ? AND active = TRUE LIMIT 1', [uuid]);
            connection.end();
        } else {
            [result] = await connection.execute('SELECT reason, banned_by_uuid, banned_by_name, time, until FROM litebans_mutes WHERE uuid = ? AND active = TRUE LIMIT 1', [uuid]);
            connection.end();
        }

        if (result.length === 0) {
            return undefined;
        }

        return {
            uuid: uuid,
            reason: result[0].reason,
            bannedByUUID: result[0].banned_by_uuid,
            bannedByName: result[0].banned_by_name,
            date: `<t:${result[0].time.toString().substring(0, result[0].time.toString().length - 3)}>`,
            ago: `<t:${result[0].time.toString().substring(0, result[0].time.toString().length - 3)}:R>`,
            until: result[0].until === -1 ? '❌ **Permanent**' : `⏳ <t:${result[0].until.toString().substring(0, result[0].until.toString().length - 3)}>`,
        };
    }
}

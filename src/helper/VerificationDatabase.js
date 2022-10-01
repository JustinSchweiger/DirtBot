import minecraftPlayer from 'minecraft-player';
import mysql from 'mysql2/promise';
import { Level, Logger } from './Logger.js';

export class Database {
    static async connect() {
        let conn = undefined;
        try {
            conn = await mysql.createConnection({
                host: process.env.HOST,
                user: process.env.USER,
                database: process.env.DATABASE,
            });
        } catch (err) {
            await Logger.log('The verification database can\'t be reached!', Level.ERROR);
        }

        return conn;
    }

    static async getUsername(discordId) {
        const connection = await this.connect();
        if (!connection) return undefined;

        const [res] = await connection.execute('SELECT uuid FROM verification WHERE discordid = ?', [discordId]);
        connection.end();

        if (res.length === 0) {
            return '';
        }

        const result = await minecraftPlayer(res[0].uuid).catch(() => {
            return undefined;
        });

        if (!result) return undefined;
        return result.username;
    }

    static async getUuidFromDiscordId(discordId) {
        const connection = await this.connect();
        if (!connection) return '';

        const [res] = await connection.execute('SELECT uuid FROM verification WHERE discordid = ?', [discordId]);
        connection.end();

        if (res.length === 0) {
            return '';
        }

        return res[0].uuid;
    }

    static async getUuidFromUsername(username) {
        const res = await minecraftPlayer(username).catch(() => {
            return undefined;
        });

        if (!res) return undefined;
        return res.uuid;
    }
}

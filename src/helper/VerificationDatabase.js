import mysql from 'mysql2/promise';
import { Level, Logger } from './Logger.js';
import { Minecraft } from './Minecraft.js';

export class Database {
    static async connect() {
        let conn = undefined;
        try {
            conn = await mysql.createConnection({
                host: process.env.HOST,
                user: process.env.USER,
                database: process.env.VERIFICATION_DATABASE,
            });
        } catch (err) {
            await Logger.log('The verification database can\'t be reached!', Level.ERROR);
        }

        return conn;
    }

    static async insertVerificationCode(discordId, code) {
        const connection = await this.connect();
        if (!connection) return undefined;

        await connection.execute('INSERT INTO verification (discordid, code) VALUES (?, ?)', [discordId, code]).catch(() => { return undefined; });
        connection.end();
    }

    static async hasUnusedCode(discordId) {
        const connection = await this.connect();
        if (!connection) return undefined;

        const [res] = await connection.execute('SELECT code FROM verification WHERE discordid = ?', [discordId]);
        connection.end();

        if (res.length === 0) {
            return false;
        }

        return res[0].code;
    }

    static async linkUser(discordId, uuid) {
        const connection = await this.connect();
        if (!connection) return undefined;

        await this.insertVerificationCode(discordId, null);
        await connection.execute('UPDATE verification SET uuid = ? WHERE discordid = ?', [uuid, discordId]);
        await connection.execute('UPDATE verification SET code = NULL WHERE discordid = ?', [discordId]);
        connection.end();

        return true;
    }

    static async unlinkUser(discordId) {
        const connection = await this.connect();
        if (!connection) return undefined;

        await connection.execute('DELETE FROM verification WHERE discordid = ?', [discordId]);
        connection.end();

        return true;
    }

    static async hasUser(discordId) {
        const connection = await this.connect();
        if (!connection) return 'no-connection';

        const [res] = await connection.execute('SELECT * FROM verification WHERE discordid = ?', [discordId]);
        connection.end();

        return res.length !== 0;
    }

    static async getUsername(discordId) {
        const connection = await this.connect();
        if (!connection) return undefined;

        const [res] = await connection.execute('SELECT uuid FROM verification WHERE discordid = ?', [discordId]);
        connection.end();

        if (res.length === 0) {
            return '';
        }

        const result = await Minecraft.getUsername(res[0].uuid);
        if (!result) return undefined;
        return result.username;
    }

    static async getUuidFromDiscordId(discordId) {
        const connection = await this.connect();
        if (!connection) return 'no-connection';

        const [res] = await connection.execute('SELECT uuid FROM verification WHERE discordid = ?', [discordId]);
        connection.end();

        if (res.length === 0) {
            return '';
        }

        return res[0].uuid;
    }
}

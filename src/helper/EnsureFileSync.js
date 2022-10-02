import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { File } from './GetFileFromGitlab.js';
import { Level, Logger } from './Logger.js';

export class GitLabFile {
    static async serve(fileName) {
        const filePath = resolve('./assets/' + fileName);
        try {
            const file = await File.get(fileName);
            const json = JSON.parse(file);
            if (!existsSync(filePath) || JSON.stringify(JSON.parse(readFileSync(filePath))) !== JSON.stringify(json)) {
                writeFileSync(filePath, JSON.stringify(json, null, 2));
            }
        } catch (err) {
            await Logger.log(`Error fetching ${fileName}: Invalid JSON`, Level.ERROR);
        }
    }
}
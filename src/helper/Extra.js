import { File } from './GetFileFromGitlab.js';
import { Level, Logger } from './Logger.js';

export class Extra {
    static async get() {
        let extra;
        try {
            extra = JSON.parse(await File.get('extra.json'));
        } catch (err) {
            await Logger.log('Error fetching extra.json', Level.ERROR);
            return undefined;
        }

        return extra;
    }
}
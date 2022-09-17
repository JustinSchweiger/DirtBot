import { Gitlab } from '../../index.js';

export class File {
    static async get(path) {
        return await Gitlab.RepositoryFiles.showRaw(process.env.PROJECT_ID, path, 'main');
    }
}

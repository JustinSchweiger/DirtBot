const { GitLab } = require('../../index');

module.exports.File = {
    async get(path) {
        return await GitLab.RepositoryFiles.showRaw(process.env.PROJECT_ID, path, 'main');
    },
};
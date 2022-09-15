const { Api } = require('../../index');

module.exports.File = {
    async get(path) {
        return await Api.RepositoryFiles.showRaw(process.env.PROJECT_ID, path, 'main');
    },
};
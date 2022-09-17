const { File } = require('./GetFileFromGitlab');
const { Logger, Level } = require('./Logger');

module.exports.Extra = {
    async get() {
        let extra;
        try {
            extra = JSON.parse(await File.get('extra.json'));
        } catch (err) {
            await Logger.log('Error fetching extra.json', Level.ERROR);
            return undefined;
        }

        return extra;
    },
};
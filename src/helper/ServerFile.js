const path = require('path');
const { File } = require('./GetFileFromGitlab');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { Logger, Level } = require('./Logger');

module.exports.ServersFile = {
    serve: async (interaction) => {
        const serversPath = path.join(__dirname, '..', '..', 'assets', 'servers.json');
        try {
            const file = await File.get('servers.json');
            const json = JSON.parse(file);
            if (!existsSync(serversPath) || JSON.stringify(JSON.parse(readFileSync(serversPath))) !== JSON.stringify(json)) {
                writeFileSync(serversPath, JSON.stringify(json, null, 2));
            }
        } catch (err) {
            await interaction.reply('Error fetching servers.json');
            await Logger.log('Error fetching servers.json: Invalid JSON', Level.ERROR);
        }
    },
};
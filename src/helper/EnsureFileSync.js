const path = require('path');
const { File } = require('./GetFileFromGitlab');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { Logger, Level } = require('./Logger');

module.exports.GitLabFile = {
    serve: async (interaction, fileName) => {
        const filePath = path.join(__dirname, '..', '..', 'assets', fileName);
        try {
            const file = await File.get(fileName);
            const json = JSON.parse(file);
            if (!existsSync(filePath) || JSON.stringify(JSON.parse(readFileSync(filePath))) !== JSON.stringify(json)) {
                writeFileSync(filePath, JSON.stringify(json, null, 2));
            }
        } catch (err) {
            await interaction.reply(`Error fetching ${fileName}`);
            await Logger.log(`Error fetching ${fileName}: Invalid JSON`, Level.ERROR);
        }
    },
};
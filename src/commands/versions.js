const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { File } = require('../helper/GetFileFromGitlab');
const { existsSync, readFileSync, writeFileSync, statSync } = require('fs');
const path = require('path');
const Logger = require('../helper/Logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('versions')
        .setDescription('Shows the versions of all our servers.'),
    execute: async function(interaction) {
        const serversPath = path.join(__dirname, '..', '..', 'assets', 'servers.json');
        try {
            const file = await File.get('servers.json');
            const json = JSON.parse(file);
            if (!existsSync(serversPath) || !readFileSync(serversPath).equals(Buffer.from(json))) {
                console.log('Writing servers.json');
                writeFileSync(serversPath, JSON.stringify(json, null, 2));
            }
        } catch (err) {
            interaction.reply('Error fetching data!');
            await Logger.log('Error fetching servers.json: Invalid JSON', Logger.level.error);
            return;
        }

        const serversJson = JSON.parse(readFileSync(serversPath).toString());
        const stats = statSync(serversPath);
        const date = new Date(stats.mtime);

        const versions = [
            {
                name: '__Modpack__',
                value: serversJson
                    .filter(server => !server['server'].includes('Pixelmon'))
                    .map(server => {
                        if (server['new'] === true) {
                            return `:new: ${server['server']}`;
                        }
                        return server['server'];
                    }).join('\n'),
                inline: true,
            },
            {
                name: '__MC-Version__',
                value: serversJson
                    .filter(server => !server['server'].includes('Pixelmon'))
                    .map(server => server['mc-version'])
                    .join('\n'),
                inline: true,
            },
            {
                name: '__Version__',
                value: `**${serversJson
                    .filter(server => !server['server'].includes('Pixelmon'))
                    .map(server => server['modpack-version'])
                    .join('\n')
                }**`,
                inline: true,
            },
        ];

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle('<:redbulletpoint:1019567816757751888> DirtCraft Modpack Versions <:redbulletpoint:1019567816757751888>')
            .addFields(versions)
            .setFooter({ text: 'Last Update ', iconURL: 'https://i.imgur.com/eyyy6A4.png' })
            .setTimestamp(date);

        interaction.reply({ embeds: [embed] });
    },
};
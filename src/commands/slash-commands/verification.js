import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('verification')
        .setDescription('Shows a guide on how to verify your account.'),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async execute(interaction) {
        const extra = await Extra.get();
        const channels = JSON.parse(readFileSync(resolve('./src/config/channels.json')));
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));
        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Limits ${extra['bulletpoint']}`)
            .setDescription(`You can link your Minecraft and Discord account in <#${channels.verificationChannel}>.\n` +
                '\n' +
                '**Doing so will get you the following perks:**\n' +
                '\n' +
                `    ➡ Gives you the special role <@&${roles.verified}>.\n` +
                '    ➡ You can now make new forum entries.\n' +
                '    ➡ You can now talk in gamechat channels.\n' +
                '    ➡ You can now use commands in gamechats (**type !help**).\n' +
                `    ➡ If you have bought a rank you get the <@&${roles.donator}> role.\n` +
                '    ➡ Your username is automatically filled when you open tickets.\n',
            )
            .setFooter({ text: 'Tip of the day: Verifying is worth it :)', iconURL: extra['footer-icon'] })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('eula')
        .setDescription('Shows information about Minecraft\'s EULA.'),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async execute(interaction) {
        const extra = await Extra.get();
        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft EULA Statement ${extra['bulletpoint']}`)
            .setDescription('It needs to be noted that the Mojang Minecraft EULA has changed several times over the years.\n' +
                '\n' +
                'A previous version indicated that no part of the Vanilla game could be sold for real money.\n' +
                '**This has since changed.**\n' +
                '\n' +
                'The EULA was updated on the **17th of April 2020**.\n' +
                'It now states on the topic that: \n' +
                '\n' +
                '```"YOU MAY: ... sell entitlements that affect gameplay provided that they do not adversely or negatively another player’s experience and provided they do not give a competitive gameplay advantage."```\n' +
                '\n' +
                'Based on the common reading of this term in the EULA, we are allowed to operate as we do because we do not, as a mainly PvE server, offer a competitive gamemode or experience to players in exchange for real money.\nWhere we do include a competitive PvP environment, these real money perks are **NOT** available.\n' +
                '\n' +
                'Please feel free to read the Mojang Minecraft EULA yourself at: https://www.minecraft.net/en-us/terms . \n' +
                'The quote I have used is from the `COMMERCIAL USAGE GUIDELINES` section.\n' +
                '\n' +
                'If you do not feel this is adequate, you can report us, or other \'P2W\' servers to Mojang here: http://aka.ms/mce-ReportServer')
            .setFooter({ text: 'DirtCraft EULA Statement', iconURL: extra['footer-icon'] })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
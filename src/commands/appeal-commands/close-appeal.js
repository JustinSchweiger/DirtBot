import { ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import { AppealManager } from '../../helper/manager/AppealManager.js';

export default {
    extra: {
        hidden: false,
        inHelp: false,
    },
    GetButton() {
        return new ButtonBuilder()
            .setCustomId('close-appeal')
            .setLabel('Close Appeal')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Secondary);
    },
    async execute(interaction) {
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));
        const extra = await Extra.get();
        const channel = interaction.guild.channels.cache.get(interaction.channel.id);

        if (!interaction.member.roles.cache.get(roles.staff)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#df0000')
                        .setDescription('You do not have permission to close this appeal!'),
                ],
            });
        }

        const appealLogEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Appeal System ${extra['bulletpoint']}`)
            .setDescription(`Appeal #${channel.name} **forcefully closed** by ${interaction.user}`)
            .addFields([
                {
                    name: '__**Appeal Information:**__',
                    value: `**Appeal Channel:** ${channel}\n` +
                        `**Action completed by:** ${interaction.user}`,
                    inline: false,
                },
            ]).setTimestamp();

        await AppealManager.logAppealEmbed(appealLogEmbed);
        interaction.channel.delete();
        unlinkSync(resolve(`./appeals/${channel.id}.json`));
    },
};
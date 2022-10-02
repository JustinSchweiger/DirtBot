import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Client } from '../../../index.js';
import { Extra } from '../../helper/Extra.js';

export default {
    extra: {
        hidden: true,
    },
    async ReloadButtons() {
        const roleAssignmentChannel = Client.channels.cache.get(JSON.parse(readFileSync(resolve('./src/config/channels.json'))).roleAssignmentChannel);
        const message = await roleAssignmentChannel.messages.fetch({ limit: 1 });
        const roleAssignments = JSON.parse(readFileSync(resolve('./src/config/role-assignments.json')));

        const buttons = roleAssignments.map(role => {
            return new ButtonBuilder()
                .setCustomId(role['role'])
                .setLabel(role['label'])
                .setStyle(role['style'])
                .setEmoji(role['emoji']);
        });

        const actionRows = [];
        for (let i = 0; i < buttons.length; i += 5) {
            actionRows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
        }

        await message.first().edit({ components: actionRows });
    },
    async RoleAssignmentEmbed() {
        const extra = await Extra.get();

        const verificationChannel = Client.channels.cache.get(JSON.parse(readFileSync(resolve('./src/config/channels.json'))).verificationChannel);

        return new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Role Assignment ${extra['bulletpoint']}`)
            .addFields([
                {
                    name: '\u200b',
                    value: '**Welcome to DirtCraft!**' +
                        '\n\nTo get started, please select the roles you would like to have in the server.\n' +
                        'This will unlock gamechats and specific modpack channels for you!' +
                        `\n\nPlease also head over to ${verificationChannel} to link your Minecraft & Discord account for even more features!`,
                    inline: false,
                },
            ])
            .setFooter({ text: 'To remove a role just click the button again!', iconURL: extra['footer-icon'] })
            .setTimestamp();
    },
    async execute(interaction) {
        const roleToAdd = interaction.guild.roles.cache.get(interaction.customId);
        const roleAssignments = JSON.parse(readFileSync(resolve('./src/config/role-assignments.json')));
        const role = roleAssignments.find(r => r['role'] === interaction.customId);

        if (interaction.member.roles.cache.has(roleToAdd.id)) {
            interaction.member.roles.remove(roleToAdd);
            interaction.reply({ embeds: [new EmbedBuilder().setColor('#df0000').setDescription(`Removed role ${role['emoji']} ${roleToAdd}`)], ephemeral: true });
        } else {
            interaction.member.roles.add(roleToAdd);
            interaction.reply({ embeds: [new EmbedBuilder().setColor('#df0000').setDescription(`Added role ${role['emoji']} ${roleToAdd}`)], ephemeral: true });
        }
    },
};
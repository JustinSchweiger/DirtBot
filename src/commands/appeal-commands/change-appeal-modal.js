import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import { AppealManager } from '../../helper/manager/AppealManager.js';
import { Minecraft } from '../../helper/Minecraft.js';
import { Database as PunishmentDatabase } from '../../helper/PunishmentDatabase.js';
import { Database as VerificationDatabase } from '../../helper/VerificationDatabase.js';
import AcceptAppeal from './accept-appeal.js';
import ChangeAppeal from './change-appeal.js';
import CloseAppeal from './close-appeal.js';
import DenyAppeal from './deny-appeal.js';

export default {
    extra: {
        hidden: true,
        inHelp: false,
    },
    async showModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('change-appeal-modal')
            .setTitle('Change Appeal');

        const username = new TextInputBuilder()
            .setCustomId('appeal-username')
            .setLabel('New Username')
            .setPlaceholder('Changes the data of the appeal')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(16)
            .setMinLength(3)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(username),
        );

        await interaction.showModal(modal);
    },
    async execute(interaction) {
        const channel = interaction.guild.channels.cache.get(interaction.channel.id);
        const username = interaction.fields.getTextInputValue('appeal-username');
        const appeal = JSON.parse(readFileSync(resolve(`./appeals/${channel.id}.json`)));
        const extra = await Extra.get();

        const uuid = await Minecraft.getUUID(username);

        if (!uuid) {
            return interaction.reply({ content: 'Please enter a valid username.', ephemeral: true });
        }

        await interaction.deferUpdate();

        let embed;
        const punishmentData = await PunishmentDatabase.getPunishmentData(uuid, appeal.type);
        let punisher = punishmentData ? await VerificationDatabase.getDiscordIdFromUuid(punishmentData.bannedByUUID) : undefined;

        if (punisher === 'no-connection') {
            punisher = undefined;
        }

        if (punishmentData) {
            embed = new EmbedBuilder()
                .setColor('#df0000')
                .setTitle(`${extra['bulletpoint']} DirtCraft Appeal System ${extra['bulletpoint']}`)
                .addFields([
                    {
                        name: '__**User**__',
                        value: `<@${interaction.user.id}>\n\u200b`,
                        inline: true,
                    },
                    {
                        name: '\u200b',
                        value: '\u200b',
                        inline: true,
                    },
                    {
                        name: '__**Username**__',
                        value: `[${username}](https://namemc.com/profile/${uuid})\n\u200b`,
                        inline: true,
                    },
                    {
                        name: '__**Original Ban Message**__',
                        value: `\`\`\`${punishmentData.reason}\`\`\`\n\u200b`,
                        inline: false,
                    },
                    {
                        name: '__**Date Punished**__',
                        value: `${punishmentData.date}\n\u200b`,
                        inline: true,
                    },
                    {
                        name: '__**Time Since**__',
                        value: `${punishmentData.ago}\n\u200b`,
                        inline: true,
                    },
                    {
                        name: '__**Punished Until**__',
                        value: `${punishmentData.until}\n\u200b`,
                        inline: true,
                    },
                    {
                        name: '__**Punisher**__',
                        value: `${punisher ? `<@${punisher}>` : '**Unknown**'}\n\u200b`,
                        inline: true,
                    },
                    {
                        name: '\u200b',
                        value: '\u200b',
                        inline: true,
                    },
                    {
                        name: '__**Punishment Type**__',
                        value: appeal.type === 'ban' ? '🚫 Ban' : '🔇 Mute' + '\n\u200b',
                        inline: true,
                    },
                    {
                        name: '__**Why should the punishment be lifted?**__',
                        value: `\`\`\`${appeal.message}\`\`\``,
                        inline: false,
                    },
                ]).setFooter({ text: 'DirtCraft Appeal System', iconURL: extra['footer-icon'] })
                .setTimestamp();
        } else {
            embed = new EmbedBuilder()
                .setColor('#df0000')
                .setTitle(`${extra['bulletpoint']} DirtCraft Appeal System ${extra['bulletpoint']}`)
                .setDescription('Could not find the original punishment data :(')
                .addFields([
                    {
                        name: '__**Punishment Type**__',
                        value: appeal.type === 'ban' ? '🚫 Ban' : '🔇 Mute' + '\n\u200b',
                        inline: false,
                    },
                    {
                        name: '__**Why should the punishment be lifted?**__',
                        value: `\`\`\`${appeal.message}\`\`\``,
                        inline: false,
                    },
                ]).setFooter({ text: 'DirtCraft Appeal System', iconURL: extra['footer-icon'] })
                .setTimestamp();
        }

        const embedId = await channel.messages.fetch(appeal.embedId);
        await embedId.edit({
            embeds: [embed],
            components: [
                new ActionRowBuilder().addComponents([
                    AcceptAppeal.GetButton(),
                    DenyAppeal.GetButton(),
                    CloseAppeal.GetButton(),
                    ChangeAppeal.GetButton(),
                ]),
            ],
        });

        if (punisher) {
            await channel.send(`<@${punisher}>`).then(m => m.delete());
        }

        const data = {
            ...punishmentData,
            type: appeal.type,
            message: appeal.message,
            username: username,
            channelId: channel.id,
            embedId: embedId.id,
            appealUUID: appeal.appealUUID,
            userDiscordId: appeal.userDiscordId,
        };

        writeFileSync(resolve(`./appeals/${channel.id}.json`), JSON.stringify(data, null, 2));

        const appealLogEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Appeal System ${extra['bulletpoint']}`)
            .setDescription(`**Old Username:** ${appeal.username}\n**New Username:** ${username}`)
            .addFields([
                {
                    name: '__**Appeal Information:**__',
                    value: `**Appeal Channel:** ${channel}\n` +
                        `**Action completed by:** ${interaction.user}`,
                    inline: false,
                },
            ]).setTimestamp();

        await AppealManager.logAppealEmbed(appealLogEmbed);
    },
};
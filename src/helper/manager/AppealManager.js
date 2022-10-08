import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '../../../index.js';
import AcceptAppeal from '../../commands/appeal-commands/accept-appeal.js';
import ChangeAppeal from '../../commands/appeal-commands/change-appeal.js';
import CloseAppeal from '../../commands/appeal-commands/close-appeal.js';
import DenyAppeal from '../../commands/appeal-commands/deny-appeal.js';
import { Extra } from '../Extra.js';
import { Database as PunishmentDatabase } from '../PunishmentDatabase.js';
import { Database as VerificationDatabase } from '../VerificationDatabase.js';


export class AppealManager {
    static async createNewAppeal(interaction, username, uuid, message, type) {
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));
        const extra = await Extra.get();

        const newChannel = await interaction.guild.channels.create({
            parent: JSON.parse(readFileSync(resolve('./src/config/channels.json')))['punishmentAppealsCategory'],
            name: interaction.member.nickname || interaction.user.username,
            type: ChannelType.GuildText,
            reason: `${type}-appeal`,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: roles['staff'],
                    allow: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel],
                },
            ],
        });

        let embed;
        const punishmentData = await PunishmentDatabase.getPunishmentData(uuid, type);
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
                        value: punishmentData.type === 'ban' ? '🚫 Ban' : '🔇 Mute' + '\n\u200b',
                        inline: true,
                    },
                    {
                        name: '__**Why should the punishment be lifted?**__',
                        value: `\`\`\`${message}\`\`\``,
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
                        value: type === 'ban' ? '🚫 Ban' : '🔇 Mute' + '\n\u200b',
                        inline: false,
                    },
                    {
                        name: '__**Why should the punishment be lifted?**__',
                        value: `\`\`\`${message}\`\`\``,
                        inline: false,
                    },
                ]).setFooter({ text: 'DirtCraft Appeal System', iconURL: extra['footer-icon'] })
                .setTimestamp();
        }

        const embedId = await newChannel.send({
            embeds: [embed],
            components: [
                new ActionRowBuilder().addComponents([
                    AcceptAppeal.GetButton(),
                    DenyAppeal.GetButton(),
                    CloseAppeal.GetButton(),
                    ChangeAppeal.GetButton(),
                ]),
            ],
        }).then(m => m.pin());

        if (punisher) {
            await newChannel.send(`<@${punisher}>`).then(m => m.delete());
        }

        const data = {
            ...punishmentData,
            type: type,
            message: message,
            username: username,
            channelId: newChannel.id,
            embedId: embedId.id,
            appealUUID: uuidv4(),
            userDiscordId: interaction.user.id,
        };

        writeFileSync(resolve(`./appeals/${newChannel.id}.json`), JSON.stringify(data, null, 2));
        await this.logAppealCreation(newChannel, username, message, interaction.user);
        return newChannel;
    }

    static async logAppealCreation(newChannel, username, message, author) {
        const extra = await Extra.get();

        const fields = [
            {
                name: '__**New Appeal**__',
                value: `**Username:** ${username}`,
                inline: false,
            },
            {
                name: '__**Appeal Message**__',
                value: `\`\`\`${message}\`\`\``,
                inline: false,
            },
            {
                name: '__**Appeal Information:**__',
                value: `**Appeal Channel:** ${newChannel}\n` +
                    `**Action completed by:** ${author}`,
                inline: false,
            },
        ];

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Appeal System ${extra['bulletpoint']}`)
            .addFields(fields)
            .setTimestamp();

        await this.logAppealEmbed(embed);
    }

    static async logAppealEmbed(embed) {
        const appealLogId = JSON.parse(readFileSync(resolve('./src/config/channels.json')))['appealLogChannel'];
        const logChannel = Client.channels.cache.get(appealLogId);
        await logChannel.send({ embeds: [embed] });
    }

    static hasOpenAppeal(userId, type) {
        const appealPath = resolve('./appeals');
        const files = readdirSync(appealPath).filter(f => f.endsWith('.json'));

        for (const file of files) {
            const data = JSON.parse(readFileSync(resolve(appealPath, file)));
            if (data.userDiscordId === userId && data.type === type) {
                return true;
            }
        }

        return false;
    }
}
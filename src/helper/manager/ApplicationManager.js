import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Client } from '../../../index.js';
import AcceptApplication from '../../commands/application-commands/accept-application.js';
import DenyApplication from '../../commands/application-commands/deny-application.js';
import NoLongerStaff from '../../commands/application-commands/no-longer-staff.js';
import { Extra } from '../Extra.js';

export class ApplicationManager {
    static async createNewDevApp(interaction, age, time, experience, language, api) {
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));

        const newChannel = await interaction.guild.channels.create({
            parent: JSON.parse(readFileSync(resolve('./src/config/channels.json')))['applicationCategory'],
            name: `dev-app-${interaction.member.nickname || interaction.user.username}`,
            type: ChannelType.GuildText,
            reason: 'New Developer Application',
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: roles['moderator'],
                    allow: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel],
                },
            ],
        });

        const extra = await Extra.get();
        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Developer Application ${extra['bulletpoint']}`)
            .setThumbnail(extra['dev-thumbnail'])
            .addFields([
                {
                    name: '__**User**__',
                    value: `<@${interaction.user.id}>\n`,
                    inline: true,
                },
                {
                    name: '__**Age**__',
                    value: age,
                    inline: true,
                },
                {
                    name: '__**Can Contribute**__',
                    value: time,
                    inline: false,
                },
                {
                    name: '__**Overall Experience**__',
                    value: experience,
                    inline: false,
                },
                {
                    name: '__**Preferred Languages**__',
                    value: language,
                    inline: false,
                },
                {
                    name: '__**API-Experience**__',
                    value: api,
                    inline: false,
                },
            ]).setFooter({
                text: 'Click the ❌ below if you are no longer interested in being staff!',
                iconURL: extra['footer-icon'],
            })
            .setTimestamp();

        const embedId = await newChannel.send({
            embeds: [embed],
            components: [
                new ActionRowBuilder().addComponents(
                    NoLongerStaff.GetButton(),
                    AcceptApplication.GetButton(),
                    DenyApplication.GetButton(),
                ),
            ],
        }).then((message) => message.pin());

        const data = {
            embedId: embedId.id,
            channelId: newChannel.id,
            userId: interaction.user.id,
            age: age,
            time: time,
            experience: experience,
            language: language,
            api: api,
            type: 'dev',
        };
        writeFileSync(resolve(`./applications/${newChannel.id}.json`), JSON.stringify(data, null, 2));

        await this.logApplicationChange('create-dev', data, interaction.user, newChannel);

        return newChannel;
    }

    static async createNewStaffApp(interaction, username, server, age, why, experience) {
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));

        const newChannel = await interaction.guild.channels.create({
            parent: JSON.parse(readFileSync(resolve('./src/config/channels.json')))['applicationCategory'],
            name: `staff-app-${interaction.member.nickname || interaction.user.username}`,
            type: ChannelType.GuildText,
            reason: 'New Staff Application',
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: roles['moderator'],
                    allow: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel],
                },
            ],
        });

        const extra = await Extra.get();
        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Staff Application ${extra['bulletpoint']}`)
            .setThumbnail(extra['staff-thumbnail'])
            .addFields([
                {
                    name: '__**Username**__',
                    value: username,
                    inline: true,
                },
                {
                    name: '__**User**__',
                    value: `<@${interaction.user.id}>\n`,
                    inline: true,
                },
                {
                    name: '__**Prior Experience**__',
                    value: experience,
                    inline: false,
                },
                {
                    name: '__**Server**__',
                    value: server,
                    inline: true,
                },
                {
                    name: '__**Age**__',
                    value: age,
                    inline: true,
                },
                {
                    name: '__**Why They Want To Be Staff**__',
                    value: why,
                    inline: false,
                },
            ]).setFooter({
                text: 'Click the ❌ below if you are no longer interested in being staff!',
                iconURL: extra['footer-icon'],
            })
            .setTimestamp();

        const embedId = await newChannel.send({
            embeds: [embed],
            components: [
                new ActionRowBuilder().addComponents(
                    NoLongerStaff.GetButton(),
                    AcceptApplication.GetButton(),
                    DenyApplication.GetButton(),
                ),
            ],
        }).then((message) => message.pin());

        const data = {
            embedId: embedId.id,
            channelId: newChannel.id,
            userId: interaction.user.id,
            username: username,
            server: server,
            age: age,
            experience: experience,
            why: why,
            type: 'staff',
        };
        writeFileSync(resolve(`./applications/${newChannel.id}.json`), JSON.stringify(data, null, 2));

        await this.logApplicationChange('create-staff', data, interaction.user, newChannel);

        return newChannel;
    }

    static async isApplication(interaction) {
        const openApplications = readdirSync(resolve('./applications'));
        if (!openApplications.includes(interaction.channel.id + '.json')) {
            await interaction.reply({
                content: 'This command can only be run in an application channel!',
                ephemeral: false,
            });
            return false;
        }

        return true;
    }

    static async silentClose(interaction, channel) {
        await channel.delete();
        unlinkSync(resolve(`./applications/${channel.id}.json`));
    }

    static async logApplicationEmbed(embed) {
        const applicationLogId = JSON.parse(readFileSync(resolve('./src/config/channels.json')))['applicationLogChannel'];
        const applicationLogChannel = Client.channels.cache.get(applicationLogId);
        await applicationLogChannel.send({ embeds: [embed] });
    }

    static async logApplicationChange(key, value, user, channel) {
        const extra = await Extra.get();
        const embedInfo = {
            name: undefined,
            value: undefined,
        };

        switch (key) {
            case 'create-staff':
                embedInfo.name = '__**New Staff Application**__';
                embedInfo.value = `**Username:** ${value.username}\n**User:** <@${value.userId}>\n**Server:** ${value.server}\n**Age:** ${value.age}\n**Prior Experience:** ${value.experience}\n**Why They Want To Be Staff:** ${value.why}`;
                break;
            case 'create-dev':
                embedInfo.name = '__**New Dev Application**__';
                embedInfo.value = `**User:** <@${value.userId}>\n**Age:** ${value.age}\n**Can Contribute:** ${value.time}\n**Overall Experience:** ${value.experience}\n**Preferred Language:** ${value.language}\n**API-Experience:** ${value.api}\n`;
                break;
            case 'closed':
                embedInfo.name = '__**Application Event | Closed by Author**__';
                embedInfo.value = 'The author of this application has closed it. They didn\'t want to become staff anymore.';
                break;
            case 'accepted':
                embedInfo.name = '__**Application Event | Accepted**__';
                embedInfo.value = 'This application has been accepted!';
                break;
            case 'denied':
                embedInfo.name = '__**Application Event | Denied**__';
                embedInfo.value = `This application has been denied!\n\n**Reason:** \`\`\`${value}\`\`\``;
                break;
        }

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Applications ${extra['bulletpoint']}`)
            .addFields([
                {
                    name: embedInfo.name,
                    value: embedInfo.value,
                    inline: false,
                },
                {
                    name: '__**Application Information:**__',
                    value: `**Application Channel:** ${channel}\n` +
                        `**Action completed by:** ${user}`,
                    inline: false,
                },
            ])
            .setTimestamp();

        if (key === 'create-staff') {
            embed.setThumbnail(extra['staff-thumbnail']);
        } else if (key === 'create-dev') {
            embed.setThumbnail(extra['dev-thumbnail']);
        }

        await this.logApplicationEmbed(embed);
    }
}
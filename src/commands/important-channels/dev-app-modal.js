import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ApplicationManager } from '../../helper/ApplicationManager.js';
import { Extra } from '../../helper/Extra.js';

export default {
    extra: {
        hidden: true,
        inHelp: false,
    },
    async showModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('dev-app-modal')
            .setTitle('DirtCraft Developer Application');

        const age = new TextInputBuilder()
            .setCustomId('dev-modal-age')
            .setLabel('How old are you?')
            .setPlaceholder('How old are you?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(2);

        const time = new TextInputBuilder()
            .setCustomId('dev-modal-time')
            .setLabel('Time to Contribute')
            .setPlaceholder('How much time are you willing to contribute to the server?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(30);

        const experience = new TextInputBuilder()
            .setCustomId('dev-modal-experience')
            .setLabel('Overall Programming Experience')
            .setPlaceholder('How much experience do you have with programming?')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(300)
            .setRequired(true);

        const language = new TextInputBuilder()
            .setCustomId('dev-modal-language')
            .setLabel('What programming language(s) do you know?')
            .setPlaceholder('Please only list language that will be useful for the server. (Java, JavaScript, Kotlin, etc.)')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(200)
            .setRequired(true);

        const api = new TextInputBuilder()
            .setCustomId('dev-modal-api')
            .setLabel('What API experience do you have?')
            .setPlaceholder('Sponge, Spigot, Forge, JDA, Discord.JS, etc.')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(300)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(age),
            new ActionRowBuilder().addComponents(time),
            new ActionRowBuilder().addComponents(experience),
            new ActionRowBuilder().addComponents(language),
            new ActionRowBuilder().addComponents(api),
        );

        await interaction.showModal(modal);
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const age = interaction.fields.getTextInputValue('dev-modal-age');
        const time = interaction.fields.getTextInputValue('dev-modal-time');
        const experience = interaction.fields.getTextInputValue('dev-modal-experience');
        const language = interaction.fields.getTextInputValue('dev-modal-language');
        const api = interaction.fields.getTextInputValue('dev-modal-api');

        const extra = await Extra.get();
        const newChannel = await ApplicationManager.createNewDevApp(interaction, age, time, experience, language, api);
        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${(await extra)['bulletpoint']} DirtCraft Applications ${(await extra)['bulletpoint']}`)
            .setDescription(`Your application (${newChannel}) has been created! Click **[here](${newChannel.url})** to view it.`)
            .setFooter({ text: 'Please wait while our admins have a look at your application!', iconURL: extra['footer-icon'] })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], ephemeral: true });
    },
};
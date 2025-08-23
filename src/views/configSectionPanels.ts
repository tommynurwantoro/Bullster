import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function createLoggingConfigPanel() {
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📊 Logging Configuration')
        .setDescription('Configure bot logging features:')
        .addFields(
            { name: '📝 Features', value: '• Member join/leave logs\n• Message deletion logs\n• Role changes\n• Server activity', inline: false }
        )
        .setFooter({ text: 'Coming soon...' });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('logging_back')
                .setLabel('Back to Configuration Panel')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );

    return {
        embed,
        components: [row]
    };
}

export function createCustomizationConfigPanel() {
    const embed = new EmbedBuilder()
        .setColor('#ff00ff')
        .setTitle('🎨 Customization Configuration')
        .setDescription('Customize bot appearance and behavior:')
        .addFields(
            { name: '🎨 Features', value: '• Bot nickname\n• Custom prefixes\n• Embed colors\n• Language settings', inline: false }
        )
        .setFooter({ text: 'Coming soon...' });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('customization_back')
                .setLabel('Back to Configuration Panel')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );

    return {
        embed,
        components: [row]
    };
}

export function createAdvancedConfigPanel() {
    const embed = new EmbedBuilder()
        .setColor('#9900ff')
        .setTitle('🔧 Advanced Configuration')
        .setDescription('Advanced bot settings and features:')
        .addFields(
            { name: '⚙️ Features', value: '• API integrations\n• Custom commands\n• Webhook settings\n• Performance options', inline: false }
        )
        .setFooter({ text: 'Coming soon...' });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('advanced_back')
                .setLabel('Back to Configuration Panel')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );

    return {
        embed,
        components: [row]
    };
}

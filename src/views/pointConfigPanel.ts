import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ButtonInteraction, ChannelSelectMenuInteraction } from 'discord.js';
import { ConfigManager } from '../utils/config';

export function createPointsChannelSelectionPanel(guildId: string) {
    const config = ConfigManager.getGuildConfig(guildId);
    const embed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle('☀️ Select Points Channels')
        .setDescription('Choose the channels for your points system:')
        .addFields(
            { name: '📊 Step 1: Points Logs Channel', value: 'Select the channel where point transactions will be logged', inline: false }
            // { name: '🛒 Step 2: Marketplace Channel', value: 'Select the channel where users can exchange points', inline: false }
        )
        .setFooter({ text: 'Powered by MENI' });

    const logsRow = new ActionRowBuilder()
        .addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('points_logs_channel')
                .setPlaceholder('Select channel for points logs')
                .setChannelTypes(ChannelType.GuildText)
                .setMinValues(1)
                .setMaxValues(1)
        );

    // const marketplaceRow = new ActionRowBuilder()
    //     .addComponents(
    //         new ChannelSelectMenuBuilder()
    //             .setCustomId('points_marketplace_channel')
    //             .setPlaceholder('Select channel for marketplace')
    //             .setChannelTypes(ChannelType.GuildText)
    //             .setMinValues(1)
    //             .setMaxValues(1)
    //     );

    const buttonRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('points_feature_disable')
                .setLabel('Disable Points Feature')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
                .setDisabled(!config?.points?.logsChannel),
            new ButtonBuilder()
                .setCustomId('points_back')
                .setLabel('Back to Configuration Panel')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );

    return {
        embed,
        components: [logsRow, buttonRow]
    };
}

export async function showPointsConfigPanel(interaction: ButtonInteraction | ChannelSelectMenuInteraction, additionalMessage?: string) {
    if (!interaction.guildId) return;
    const panel = createPointsChannelSelectionPanel(interaction.guildId);
    if (!panel) return;
    await interaction.update({
        content: additionalMessage || '',
        embeds: [panel.embed],
        components: [panel.components[0] as any, panel.components[1] as any]
    });
}
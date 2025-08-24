import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ButtonInteraction, ChannelSelectMenuInteraction, TextDisplayBuilder } from 'discord.js';
import { ConfigManager } from '../../utils/config';

export function createPointsChannelSelectionPanel(guildId: string, messageId: string) {
    const config = ConfigManager.getGuildConfig(guildId);
    const embed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle('☀️ Select Points Channels')
        .setDescription('Select the channel where point transactions will be logged')
        .setFooter({ text: 'Powered by BULLSTER' });

    const logsRow = new ActionRowBuilder()
        .addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId(`points_logs_channel:${messageId}`)
                .setPlaceholder('Select channel for points logs')
                .setChannelTypes(ChannelType.GuildText)
                .setMinValues(1)
                .setMaxValues(1)
                .setDefaultChannels(config?.points?.logsChannel ? [config.points.logsChannel] : [])
                .setDisabled(config?.points?.logsChannel ? true : false)
        );

    const buttonRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`points_feature_disable:${messageId}`)
                .setLabel('Disable Points Feature')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
                .setDisabled(!config?.points?.logsChannel),
            new ButtonBuilder()
                .setCustomId('main_back')
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
    const panel = createPointsChannelSelectionPanel(interaction.guildId, interaction.message.id);
    if (!panel) return;
    await interaction.update({
        content: additionalMessage || '',
        embeds: [panel.embed],
        components: [panel.components[0] as any, panel.components[1] as any]
    });
}
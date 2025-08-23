import { ButtonInteraction } from 'discord.js';
import { createPointsChannelSelectionPanel, showMainConfigPanel } from '../views';
import { ConfigManager } from '../utils/config';
import { showPointsConfigPanel } from '../views/pointConfigPanel';

export async function handlePointsButton(interaction: ButtonInteraction) {
    const customId = interaction.customId;

    switch (customId) {
        case 'points_configure':
            await handlePointsConfigure(interaction);
            break;
        case 'points_back':
            await handlePointsBack(interaction);
            break;
        case 'points_feature_disable':
            await handlePointsFeatureDisable(interaction);
            break;
        default:
            await interaction.reply({
                content: '❌ Unknown points option',
                ephemeral: true
            });
    }
}

async function handlePointsConfigure(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;
    const panel = createPointsChannelSelectionPanel(interaction.guildId);
    await interaction.update({
        embeds: [panel.embed],
        components: [panel.components[0] as any, panel.components[1] as any, panel.components[2] as any]
    });
}

async function handlePointsBack(interaction: ButtonInteraction) {
    // This will be handled by the main button handler's back button logic
    // which will return to the main configuration panel
    await interaction.reply({
        content: 'Use the back button to return to the main configuration panel.',
        ephemeral: true
    });
}

async function handlePointsFeatureDisable(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;
    const config = ConfigManager.getGuildConfig(interaction.guildId);
    if (!config?.points?.logsChannel) return;
    ConfigManager.updateGuildConfig(interaction.guildId, {
        points: {
            logsChannel: undefined,
            marketplaceChannel: undefined
        }
    });

    const additionalMessage = `
    > ===========================
    > ✅ Successfully disabled points feature!
    > ===========================`;

    await showPointsConfigPanel(interaction, additionalMessage);
}
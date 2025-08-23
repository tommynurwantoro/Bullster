import { ButtonInteraction } from 'discord.js';
import {
    showWelcomeConfigPanel,
    createLoggingConfigPanel,
    createCustomizationConfigPanel,
    createAdvancedConfigPanel,
    createResetConfirmPanel
} from '../views';
import { createPointsChannelSelectionPanel, showPointsConfigPanel } from '../views/pointConfigPanel';
import { showModerationConfigPanel } from '../views/moderationConfigPanel';
import { showMarketplaceConfigPanel } from '../views/marketplaceConfigPanel';

export async function handleConfigButton(interaction: ButtonInteraction) {
    const customId = interaction.customId;

    switch (customId) {
        case 'config_welcome':
            await handleWelcomeConfig(interaction);
            break;
        case 'config_points':
            await handlePointsConfig(interaction);
            break;
        case 'config_moderation':
            await handleModerationConfig(interaction);
            break;
        case 'config_marketplace':
            await handleMarketplaceConfig(interaction);
            break;
        case 'config_logging':
            await handleLoggingConfig(interaction);
            break;
        case 'config_customization':
            await handleCustomizationConfig(interaction);
            break;
        case 'config_advanced':
            await handleAdvancedConfig(interaction);
            break;
        case 'config_reset':
            await handleResetConfig(interaction);
            break;
        default:
            await interaction.reply({
                content: '❌ Unknown configuration option',
                ephemeral: true
            });
    }
}

async function handleWelcomeConfig(interaction: ButtonInteraction) {
    await showWelcomeConfigPanel(interaction);
}

async function handlePointsConfig(interaction: ButtonInteraction) {
    await showPointsConfigPanel(interaction);
}

async function handleModerationConfig(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;
    await showModerationConfigPanel(interaction);
}

async function handleMarketplaceConfig(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;
    await showMarketplaceConfigPanel(interaction);
}

async function handleLoggingConfig(interaction: ButtonInteraction) {
    const panel = createLoggingConfigPanel();
    await interaction.update({
        embeds: [panel.embed],
        components: [panel.components[0] as any]
    });
}

async function handleCustomizationConfig(interaction: ButtonInteraction) {
    const panel = createCustomizationConfigPanel();
    await interaction.update({
        embeds: [panel.embed],
        components: [panel.components[0] as any]
    });
}

async function handleAdvancedConfig(interaction: ButtonInteraction) {
    const panel = createAdvancedConfigPanel();
    await interaction.update({
        embeds: [panel.embed],
        components: [panel.components[0] as any]
    });
}

async function handleResetConfig(interaction: ButtonInteraction) {
    const panel = createResetConfirmPanel();
    await interaction.update({
        embeds: [panel.embed],
        components: [panel.components[0] as any]
    });
}

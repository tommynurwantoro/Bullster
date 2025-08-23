import { ButtonInteraction } from 'discord.js';
import { showMarketplaceConfigPanel } from '../views/marketplaceConfigPanel';
import { showMarketplaceStockPanel } from '../views/marketplaceStockPanel';
import { createStockAddModal, createStockRemoveModal, createStockUpdateModal } from '../views/marketplaceStockModal';
import { ConfigManager } from '../utils/config';

export async function handleMarketplaceButton(interaction: ButtonInteraction) {
    const customId = interaction.customId;

    switch (customId) {
        case 'marketplace_disable':
            await handleMarketplaceDisable(interaction);
            break;
        case 'marketplace_stock':
            await handleMarketplaceStock(interaction);
            break;
        case 'marketplace_back':
            await handleMarketplaceBack(interaction);
            break;
        case 'stock_add':
            await handleStockAdd(interaction);
            break;
        case 'stock_update':
            await handleStockUpdate(interaction);
            break;
        case 'stock_remove':
            await handleStockRemove(interaction);
            break;
        case 'stock_back':
            await handleStockBack(interaction);
            break;
        default:
            await interaction.reply({
                content: '❌ Unknown marketplace option',
                ephemeral: true
            });
    }
}

async function handleMarketplaceDisable(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;

    try {
        const currentConfig = ConfigManager.getGuildConfig(interaction.guildId) || {};
        const pointsConfig = currentConfig.points || {};

        ConfigManager.updateGuildConfig(interaction.guildId, {
            ...currentConfig,
            points: {
                ...pointsConfig,
                marketplaceChannel: undefined
            }
        });

        const additionalMessage = `
        > ===========================
        > ✅ Marketplace disabled successfully!
        > ===========================`;
        await showMarketplaceConfigPanel(interaction, additionalMessage);

    } catch (error) {
        console.error('Error disabling marketplace:', error);
        await interaction.reply({
            content: '❌ Failed to disable marketplace. Please try again.',
            ephemeral: true
        });
    }
}

async function handleMarketplaceStock(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;
    await showMarketplaceStockPanel(interaction);
}

async function handleMarketplaceBack(interaction: ButtonInteraction) {
    // This will be handled by the main button handler's back button logic
    await interaction.reply({
        content: 'Use the back button to return to the main configuration panel.',
        ephemeral: true
    });
}

async function handleStockAdd(interaction: ButtonInteraction) {
    const modal = createStockAddModal();
    await interaction.showModal(modal);
}

async function handleStockUpdate(interaction: ButtonInteraction) {
    const modal = createStockUpdateModal();
    await interaction.showModal(modal);
}

async function handleStockRemove(interaction: ButtonInteraction) {
    const modal = createStockRemoveModal();
    await interaction.showModal(modal);
}

async function handleStockBack(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;
    await showMarketplaceConfigPanel(interaction);
}

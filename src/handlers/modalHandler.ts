import { ModalSubmitInteraction } from 'discord.js';
import { showMarketplaceStockPanel } from '../views/marketplace/marketplaceStockPanel';
import { createLinkProtectionPanel } from '../views/moderation/linkProtectionPanel';

export async function handleModal(interaction: ModalSubmitInteraction) {
    const customId = interaction.customId;

    // Check if customId contains a message ID (format: modalType:messageId)
    if (customId.includes(':')) {
        const [modalType, messageId] = customId.split(':');
        
        switch (modalType) {
            case 'stock_add_modal':
                await handleAddStockModal(interaction, messageId);
                break;
            case 'stock_update_modal':
                await handleUpdateStockModal(interaction, messageId);
                break;
            case 'stock_remove_modal':
                await handleRemoveStockModal(interaction, messageId);
                break;
            case 'link_protection_whitelist_modal':
                await handleLinkProtectionWhitelistModal(interaction, messageId);
                break;
            default:
                await interaction.reply({
                    content: '❌ Unknown modal submission',
                    ephemeral: true
                });
        }
        return;
    }

    // Handle legacy modal types without message IDs
    switch (customId) {
        case 'welcome_message_modal':
            await handleWelcomeMessageModal(interaction);
            break;
        default:
            await interaction.reply({
                content: '❌ Unknown modal submission',
                ephemeral: true
            });
    }
}

async function handleWelcomeMessageModal(interaction: ModalSubmitInteraction) {
    const { ConfigManager } = await import('../utils/config');

    const messageInput = interaction.fields.getTextInputValue('welcome_message_input');
    const guildId = interaction.guildId;
    if (!guildId) return;

    try {
        const currentConfig = ConfigManager.getGuildConfig(guildId) || {};
        const welcomeConfig = currentConfig.welcome || {};

        // Update configuration with both channel and message
        ConfigManager.updateGuildConfig(guildId, {
            ...currentConfig,
            welcome: {
                ...welcomeConfig,
                message: messageInput
            }
        });

        // Show simple success message
        await interaction.reply({
            content: `✅ Successfully updated welcome message!`,
            ephemeral: true
        });

    } catch (error) {
        console.error('Error configuring welcome system:', error);

        await interaction.reply({
            content: '❌ Failed to configure welcome system. Please check bot permissions and try again.',
            ephemeral: true
        });
    }
}

async function handleLinkProtectionWhitelistModal(interaction: ModalSubmitInteraction, messageId: string) {
    const { ConfigManager } = await import('../utils/config');

    const domainsInput = interaction.fields.getTextInputValue('whitelist_domains');
    const descriptionInput = interaction.fields.getTextInputValue('whitelist_description');
    const guildId = interaction.guildId;
    if (!guildId) return;

    try {
        // Parse domains input (split by comma and clean up)
        const domains = domainsInput
            .split(',')
            .map(domain => domain.trim())
            .filter(domain => domain.length > 0)
            .map(domain => domain.toLowerCase());

        // Update configuration with whitelist domains
        const currentConfig = ConfigManager.getGuildConfig(guildId) || {};
        const moderationConfig = currentConfig.moderation || {};

        ConfigManager.updateGuildConfig(guildId, {
            ...currentConfig,
            moderation: {
                ...moderationConfig,
                whitelistDomains: domains,
                linkProtection: true
            }
        });

        const channel = interaction.channel;

        if (channel && channel.isTextBased()) {
            const message = await channel.messages.fetch(messageId);
            if (message) {
                const panel = createLinkProtectionPanel(guildId);
                await message.edit({
                    embeds: [panel.embed],
                    components: [panel.components[0] as any, panel.components[1] as any]
                });
                await interaction.reply({
                    content: '✅ Link protection whitelist updated!',
                    ephemeral: true
                });
            }
        }
    } catch (error) {
        console.error('Error configuring link protection whitelist:', error);

        await interaction.reply({
            content: '❌ Failed to configure whitelist. Please try again.',
            ephemeral: true
        });
    }
}

async function handleAddStockModal(interaction: ModalSubmitInteraction, messageId: string) {
    const { ConfigManager } = await import('../utils/config');

    const stockName = interaction.fields.getTextInputValue('stock_name');
    const descriptionInput = interaction.fields.getTextInputValue('stock_description');
    const priceInput = interaction.fields.getTextInputValue('stock_price');
    const quantityInput = interaction.fields.getTextInputValue('stock_quantity');
    const guildId = interaction.guildId;
    if (!guildId) return;

    try {
        const currentConfig = ConfigManager.getGuildConfig(guildId) || {};
        const stockConfig = currentConfig.points?.stock || [];

        // Check if stock with the same name already exists (case-insensitive)
        const stockExists = stockConfig.some(
            stock => stock.name.trim().toLowerCase() === stockName.trim().toLowerCase()
        );

        if (stockExists) {
            await interaction.reply({
                content: `❌ A stock item with the name **${stockName}** already exists. Please choose a different name.`,
                ephemeral: true
            });
            return;
        }

        ConfigManager.updateGuildConfig(guildId, {
            ...currentConfig,
            points: {
                ...currentConfig.points,
                stock: [
                    ...stockConfig,
                    {
                        name: stockName,
                        description: descriptionInput,
                        price: Number(priceInput),
                        quantity: Number(quantityInput),
                        addedBy: interaction.user.id,
                        addedAt: new Date().toISOString()
                    }
                ]
            }
        });

        // Try to refresh the original embed using the message ID
        try {
            const channel = interaction.channel;
            if (channel && channel.isTextBased()) {
                const message = await channel.messages.fetch(messageId);
                if (message) {
                    // Refresh the marketplace stock panel in the original message
                    const { createMarketplaceStockPanel } = await import('../views/marketplace/marketplaceStockPanel');
                    const panel = createMarketplaceStockPanel(guildId);
                    
                    await message.edit({
                        embeds: [panel.embed],
                        components: [panel.components[0] as any, panel.components[1] as any]
                    });
                    
                    // Acknowledge the modal submission
                    await interaction.reply({
                        content: '✅ Stock item added successfully! The panel has been updated.',
                        ephemeral: true
                    });
                    return;
                }
            }
        } catch (fetchError) {
            console.log('Could not fetch original message, falling back to new panel');
        }

        // Fallback: Show new panel if original message can't be updated
        const additionalMessage = `
        > ===========================
        > ✅ Successfully added new stock item!
        > ===========================`;
        await showMarketplaceStockPanel(interaction, additionalMessage);
    } catch (error) {
        console.error('Error configuring stock:', error);

        await interaction.reply({
            content: '❌ Failed to configure stock. Please try again.',
            ephemeral: true
        });
    }
}

async function handleUpdateStockModal(interaction: ModalSubmitInteraction, messageId: string) {
    const { ConfigManager } = await import('../utils/config');

    const stockName = interaction.fields.getTextInputValue('stock_name');
    const descriptionInput = interaction.fields.getTextInputValue('stock_description');
    const priceInput = interaction.fields.getTextInputValue('stock_price');
    const quantityInput = interaction.fields.getTextInputValue('stock_quantity');
    const guildId = interaction.guildId;
    if (!guildId) return;

    try {
        const currentConfig = ConfigManager.getGuildConfig(guildId) || {};
        const stockConfig = currentConfig.points?.stock || [];
        let stockFound = false;

        ConfigManager.updateGuildConfig(guildId, {
            ...currentConfig,
            points: {
                ...currentConfig.points,
                stock: stockConfig.map(stock => {
                    if (stock.name.toLowerCase() === stockName.toLowerCase()) {
                        stockFound = true;
                        // Only update fields if the input is not an empty string
                        return {
                            ...stock,
                            name: stockName, // Always update name, since it's the identifier
                            description: descriptionInput !== '' ? descriptionInput : stock.description,
                            price: priceInput !== '' ? Number(priceInput) : stock.price,
                            quantity: quantityInput !== '' ? Number(quantityInput) : stock.quantity
                        };
                    }
                    return stock;
                })
            }
        });

        if (stockFound) {
            // Try to refresh the original embed using the message ID
            try {
                const channel = interaction.channel;
                if (channel && channel.isTextBased()) {
                    const message = await channel.messages.fetch(messageId);
                    if (message) {
                        // Refresh the marketplace stock panel in the original message
                        const { createMarketplaceStockPanel } = await import('../views/marketplace/marketplaceStockPanel');
                        const panel = createMarketplaceStockPanel(guildId);
                        
                        await message.edit({
                            embeds: [panel.embed],
                            components: [panel.components[0] as any, panel.components[1] as any]
                        });
                        
                        // Acknowledge the modal submission
                        await interaction.reply({
                            content: '✅ Stock item updated successfully! The panel has been updated.',
                            ephemeral: true
                        });
                        return;
                    }
                }
            } catch (fetchError) {
                console.log('Could not fetch original message, falling back to new panel');
            }

            // Fallback: Show new panel if original message can't be updated
            const additionalMessage = `
            > ===========================
            > ✅ Successfully updated stock item!
            > ===========================`;
            await showMarketplaceStockPanel(interaction, additionalMessage);
        } else {
            await interaction.reply({
                content: '❌ Stock not found. Please check the name and try again.',
                ephemeral: true
            });
        }
    } catch (error) {
        console.error('Error configuring stock:', error);

        await interaction.reply({
            content: '❌ Failed to configure stock. Please try again.',
            ephemeral: true
        });
    }
}

async function handleRemoveStockModal(interaction: ModalSubmitInteraction, messageId: string) {
    const { ConfigManager } = await import('../utils/config');

    const stockName = interaction.fields.getTextInputValue('stock_name');
    const guildId = interaction.guildId;
    if (!guildId) return;

    try {
        const currentConfig = ConfigManager.getGuildConfig(guildId) || {};
        const stockConfig = currentConfig.points?.stock || [];
        const stockIndex = stockConfig.findIndex(stock => stock.name.toLowerCase() === stockName.toLowerCase());

        if (stockIndex !== -1) {
            const updatedStock = [...stockConfig];
            updatedStock.splice(stockIndex, 1);

            ConfigManager.updateGuildConfig(guildId, {
                ...currentConfig,
                points: {
                    ...currentConfig.points,
                    stock: updatedStock
                }
            });

            // Try to refresh the original embed using the message ID
            try {
                const channel = interaction.channel;
                if (channel && channel.isTextBased()) {
                    const message = await channel.messages.fetch(messageId);
                    if (message) {
                        // Refresh the marketplace stock panel in the original message
                        const { createMarketplaceStockPanel } = await import('../views/marketplace/marketplaceStockPanel');
                        const panel = createMarketplaceStockPanel(guildId);

                        await message.edit({
                            embeds: [panel.embed],
                            components: [panel.components[0] as any, panel.components[1] as any]
                        });

                        // Acknowledge the modal submission
                        await interaction.reply({
                            content: '✅ Stock item removed successfully! The panel has been updated.',
                            ephemeral: true
                        });
                        
                        return;
                    }
                }
            } catch (fetchError) {
                console.log('Could not fetch original message, falling back to new panel');
            }

            // Fallback: Show new panel if original message can't be updated
            const additionalMessage = `
            > ===========================
            > ✅ Successfully removed stock item!
            > ===========================`;
            await showMarketplaceStockPanel(interaction, additionalMessage);
        } else {
            await interaction.reply({
                content: '❌ Stock not found. Please check the name and try again.',
                ephemeral: true
            });
        }
    } catch (error) {
        console.error('Error removing stock:', error);

        await interaction.reply({
            content: '❌ Failed to remove stock. Please try again.',
            ephemeral: true
        });
    }
}
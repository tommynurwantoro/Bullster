import { ButtonInteraction } from 'discord.js';
import { showLinkProtectionPanel } from '../views/linkProtectionPanel';
import { ConfigManager } from '../utils/config';
import { createLinkProtectionModal } from '../views/linkProtectionModal';

export async function handleLinkProtectionButton(interaction: ButtonInteraction) {
    const customId = interaction.customId;

    switch (customId) {
        case 'link_protection_enable':
            await handleLinkProtectionEnable(interaction);
            break;
        case 'link_protection_disable':
            await handleLinkProtectionDisable(interaction);
            break;
        case 'link_protection_whitelist':
            await handleLinkProtectionWhitelist(interaction);
            break;
    }
}

async function handleLinkProtectionEnable(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;
    const currentConfig = ConfigManager.getGuildConfig(interaction.guildId) || {};
    const moderationConfig = currentConfig.moderation || {};

    ConfigManager.updateGuildConfig(interaction.guildId, {
        ...currentConfig,
        moderation: {
            ...moderationConfig,
            linkProtection: true
        }
    });

    const additionalMessage = `
    > ===========================
    > ✅ Link protection enabled.
    > ===========================`;
    await showLinkProtectionPanel(interaction, additionalMessage);
}

async function handleLinkProtectionDisable(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;
    const currentConfig = ConfigManager.getGuildConfig(interaction.guildId) || {};
    const moderationConfig = currentConfig.moderation || {};

    ConfigManager.updateGuildConfig(interaction.guildId, {
        ...currentConfig,
        moderation: {
            ...moderationConfig,
            linkProtection: false,
            whitelistDomains: []
        }
    });

    const additionalMessage = `
    > ===========================
    > ✅ Link protection disabled.
    > ===========================`;
    await showLinkProtectionPanel(interaction, additionalMessage);
}

async function handleLinkProtectionWhitelist(interaction: ButtonInteraction) {
    const modal = createLinkProtectionModal();
    await interaction.showModal(modal);
}
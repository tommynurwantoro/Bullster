import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { createMainConfigPanel } from '../views';

export const data = new SlashCommandBuilder()
    .setName('configure')
    .setDescription('Open the bot configuration panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) {
        await interaction.reply({
            content: '❌ This command can only be used in a server.',
            ephemeral: true
        });
        return;
    }

    const panel = await createMainConfigPanel(interaction);
    if (!panel) {
        await interaction.reply({
            content: '❌ Failed to create configuration panel.',
            ephemeral: true
        });
        return;
    }

    await interaction.reply({
        embeds: [panel.embed],
        components: [panel.components[0] as any, panel.components[1] as any, panel.components[2] as any]
    });
}

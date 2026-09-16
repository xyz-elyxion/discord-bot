const Command = require("../../../Structures/Classes/BaseCommand");
const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");
const { t } = require("i18next");

class Rules extends Command {
  constructor(client, dir) {
    super(client, dir, {
      data: new SlashCommandBuilder()
        .setName("rules")
        .setDescription("🎗️ To check counting rules!")
        .setDMPermission(false),
      options: {
        category: "User",
      },
    });
  }
  /**
   *
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   * @param {import("../../../Structures/Classes/BotClient").BotClient} client
   * @param {string} lng
   */
  async execute(interaction, client, lng) {
    const embed = new EmbedBuilder()
      .setTitle("**Counting Rules!**")
      .setColor(Colors.DarkGreen)
      .setDescription(
        "> 1 • No Skipping Numbers\n> 2 • No Going Back In Numbers\n> 3 • Must alternate counters (except for solo mode)\n> 4 • No Botting, Scripting Or Abusing Bugs\n> 5 • Do Not Intentionally Ruin The Count"
      )
      .setTimestamp()
      .setFooter({ text: "Limey Bot - 2024" });

    interaction.reply({ embeds: [embed] });
  }
}

module.exports = Rules;

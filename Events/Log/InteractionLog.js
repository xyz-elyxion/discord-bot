const Event = require("../../Structures/Classes/BaseEvent");
const {
  Events,
  CommandInteraction,
  InteractionType,
  EmbedBuilder,
  Colors,
} = require("discord.js");

class InteractionLog extends Event {
  constructor(client) {
    super(client, {
      name: Events.InteractionCreate,
    });
  }

  async execute(interaction) {
    const { client } = this;
    if (
      interaction instanceof CommandInteraction &&
      interaction.type === InteractionType.ApplicationCommand
    ) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      let botData = await client.db.botDatas.findOne({
        password: "jasonmidul",
      });

      if (!botData) {
        await client.db.botDatas.create({ password: "jasonmidul" });
        botData = await client.db.botDatas.findOne({ password: "jasonmidul" });
      }
      const cmdsUsed = botData.cmdUsed;
      botData.cmdUsed += 1;
      botData.save();

      const channel = client.channels.cache.get(client.config.logChannel);
      if (!channel || !channel.isTextBased()) return; // log channel not available locally
      const server = interaction.guild?.name || "user";
      const user = interaction.user.username;
      const userId = interaction.user.id;

      const embed = new EmbedBuilder()
        .setDescription(`${cmdsUsed}th command`)
        .setColor(Colors.Green)
        .addFields({ name: "User", value: `${user} \`${userId}\`` })
        .addFields({ name: "Command", value: `${interaction}` })
        .addFields({
          name: "server id",
          value: `\`${interaction.guild?.id || "NuN"}\``,
        })
        .setFooter({ text: server })
        .setTimestamp();

      try {
        await channel.send({ embeds: [embed] });
      } catch (err) {
        // No access to the configured log channel — skip logging quietly.
      }
    }
  }
}

module.exports = InteractionLog;

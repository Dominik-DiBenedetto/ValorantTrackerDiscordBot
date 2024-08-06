const { SlashCommandBuilder } = require("discord.js");

let agentPool = {
  smokes: ["harbor", "omen", "astra", "brim", "clove", "viper"],
  duelist: ["pheonix", "jett", "neon", "iso", "raze", "reyna", "yoru"],
  sen: ["cypher", "kj", "chamber", "sage", "deadlock"],
  init: ["kayo", "fade", "gecko", "skye", "breach", "sova"],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("random_agent")
    .setDescription("Select a random valorant agent")
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("Select an agent from a specific role")
        .addChoices(
          { name: "controller", value: "smokes" },
          { name: "duelist", value: "duelist" },
          { name: "initiator", value: "init" },
          { name: "sentinel", value: "sen" },
        ),
    ),
  async execute(interaction) {
    const reason = interaction.options.getString("role") ?? "any";

    let agent = "";
    if (reason !== "any")
      agent = agentPool[reason][Math.floor(Math.random() * 4)];
    else {
      const roles = ["smokes", "duelist", "init", "sen"];
      agent =
        agentPool[roles[Math.floor(Math.random() * 4)]][
          Math.floor(Math.random() * 4)
        ];
    }

    await interaction.reply(`Agent selected: ${agent}`);
  },
};

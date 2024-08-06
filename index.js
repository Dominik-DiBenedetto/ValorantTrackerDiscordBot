require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");

const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const CLIENT = new Client({ intents: GatewayIntentBits.Guilds });

// Command Handler
CLIENT.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

function push_cmd(filePath) {
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    CLIENT.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
    );
  }
}

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  if (path.extname(commandsPath) === ".js") {
    push_cmd(commandsPath);
    continue;
  }

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    push_cmd(filePath);
  }
}

CLIENT.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.client.commands.get(interaction.commandName);
  if (!cmd)
    return console.warn(
      `Couldn't find a command that matches '${interaction.commandName}'`,
    );

  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error(err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
CLIENT.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
CLIENT.login(process.env.TOKEN);

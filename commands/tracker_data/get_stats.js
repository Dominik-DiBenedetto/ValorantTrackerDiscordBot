const { SlashCommandBuilder } = require("discord.js");
const puppeteer = require("puppeteer-extra");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const getStats = async (username) => {
  // Start a Puppeteer session
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0",
  );

  // Open tracker profile
  let url = `https://tracker.gg/valorant/profile/riot/${username.replace("#", "%23")}/overview`;
  console.log(url);
  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  // Get page data
  const stat_labels = await page.$$(".stat__label");
  const stat_values = await page.$$(".stat__value");

  let info = {};

  for (let i = 0; i < stat_labels.length; i++) {
    let label = stat_labels[i];
    let val = stat_values[i];

    info[await label.evaluate((x) => x.textContent)] = await val.evaluate(
      (x) => x.textContent,
    );
  }

  await page.waitForSelector(".rating-entry__rank-info");
  const peakRankDiv = await page.$$(".rating-entry__rank-info");
  if (peakRankDiv[1] == undefined) console.error("No peak rank div");
  let peakRank = await peakRankDiv[1].$(".value");
  peakRank = await peakRank.evaluate((x) => x.textContent);

  info["Peak Rank"] = peakRank;

  const nums = await page.$$(".numbers");
  for (let i = 0; i < nums.length; i++) {
    let name = await nums[i].$(".name");
    name = await name.evaluate((x) => x.textContent);

    let value = await nums[i].$(".value");
    value = await value.evaluate((x) => x.textContent);

    info[name] = value;
  }

  return info;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get_stats")
    .setDescription("retrieve valorant stats for a player!")
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription(
          "supply the riot name and tag for the user you want to check stats for!",
        )
        .setRequired(true),
    ),
  async execute(interaction) {
    await interaction.reply("Getting stats...");
    const name = interaction.options.getString("user");
    const stats = await getStats(name);

    let statsStr = `Stats for ${name}\n`;
    for (let stat in stats) {
      statsStr += `\t${stat}: ${stats[stat]}\n`;
    }

    await interaction.editReply(statsStr);
  },
};

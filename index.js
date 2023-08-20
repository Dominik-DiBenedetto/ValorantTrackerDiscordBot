const cheerio = require("cheerio")
const axios = require("axios")
const discord = require("discord.js")
const dotenv = require('dotenv').config()

// downloading the target web page 
// by performing an HTTP GET request in Axios
async function scrape(user) {
    const axiosResponse = await axios.request({
        method: "GET",
        url: `https://tracker.gg/valorant/profile/riot/${user}/overview`,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        }
    })

    const $ = cheerio.load(axiosResponse.data)

    const kdDiv = $('[title="K/D Ratio"]').parent()
    const kdText = kdDiv.find('.value').text()

    const headshotDiv = $('[title="Headshot%"]').parent()
    const headshotText = headshotDiv.find('.value').text()

    const winDiv = $('[title="Win %"]').parent()
    const winText = winDiv.find('.value').text()

    const currentRank = $('[data-v-988148a5]')
                        .first().find('.value').text().trim()

    const peakRank = $('.rating-summary__content--secondary')
    .find('.value').text().trim()

    const data = {
        "K/D": kdText,
        "Headshot%": headshotText,
        "Win %": winText,
        "Current Rank": currentRank,
        "Peak Rank": peakRank
    }

    return data
}

// Bot
const client = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds, discord.GatewayIntentBits.GuildMessages, discord.GatewayIntentBits.MessageContent] })

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('messageCreate', async msg => {
    if (msg.content.includes("!stats")) {
        msg.reply("Getting stats");
        const user = msg.content.split(' ')[1].replace('#', '%23')
        const stats = await scrape(user)
        msg.reply(`K/D: ${stats['K/D']}\nHeadshot %: ${stats["Headshot%"]}\nWin %:${stats["Win %"]}\nCurrent Rank: ${stats['Current Rank']}\nPeak: ${stats["Peak Rank"]}`)
    }
    if (msg.content === "!list") {
        msg.reply("Getting members")
        const list = await (await client.guilds.fetch("1142614209641861136")).members.fetch()
        console.log(list)
        let dispList = ''
        list.forEach(memb => dispList+=`${memb.displayName}\n`)
        msg.reply(dispList)
    }
});

client.login(process.env.TOKEN)
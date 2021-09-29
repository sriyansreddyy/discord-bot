require('dotenv').config()

const { Client, Intents } = require('discord.js')
const karma = require ('./karma')
const onboarding = require('./onboarding')

const { DISCORD_BOT_TOKEN } = process.env

const bot = new Client({ 
  partials: ['MESSAGE', 'REACTION'],
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ]
})

bot.login(DISCORD_BOT_TOKEN)

onboarding(bot)
karma(bot)

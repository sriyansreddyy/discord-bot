const Discord = require('discord.js')
const bot = new Discord.Client()
require('dotenv').config()

const WELCOME_PREFIX = 'welcome-'
const ONBOARDING_CATEGORY_ID = '855011722916790272'
const EVERYONE_ROLE_ID = '837036811825840129'

bot.on('ready', async () => {
  console.log(`Logged in as ${bot.user.id}!`)
});

bot.on('guildMemberAdd', async member => {
  const channel = await member
    .guild
    .channels
    .create(`${WELCOME_PREFIX}${member.user.discriminator}`, {
      parent: ONBOARDING_CATEGORY_ID,
      permissionOverwrites: [
        {
          id: EVERYONE_ROLE_ID,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: member.id,
          allow: ['VIEW_CHANNEL']
        }
      ]
    })
  await channel.send("welcome. what should we call you?")
})

bot.on('message', async message => {
  const { 
    channel,
    author,
    content,
    member
  } = message
  if (channel.type === "text" 
    && channel.name.startsWith(WELCOME_PREFIX)) {
    const onboardee = channel.name.split("-")[1]
    const sender = author.discriminator
    if (sender === onboardee) {
      member.setNickname(content)
      await cleanup(channel)
      await sendWelcomeDirectMessage(member)
    }
  }
})

const cleanup = channel => channel.delete()

const sendWelcomeDirectMessage = member => member.send('hi')

bot.login(process.env.TOKEN)

const Discord = require('discord.js')
const bot = new Discord.Client()

const WELCOME_PREFIX = 'welcome-'
const ONBOARDING_CATEGORY_ID = '855011722916790272'

bot.on('ready', async () => {
  console.log(`Logged in as ${bot.user.id}!`)
});

bot.on('guildMemberAdd', async member => {
  const channel = await member
    .guild
    .channels
    .create(`${WELCOME_PREFIX}${member.user.discriminator}`, {
      parent: ONBOARDING_CATEGORY_ID
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
  if (channel.name.startsWith(WELCOME_PREFIX)) {
    const onboardee = channel.name.split("-")[1]
    const sender = author.discriminator
    if (sender === onboardee) {
      member.setNickname(content)
      await cleanup(channel)
    }
  }
})

const cleanup = channel => channel.delete()

bot.login('ODU0OTg4MjcyOTAzNzgyNDEw.YMr74Q.KUDrUKjSdqczN0SWdTKzB3wAsxc')

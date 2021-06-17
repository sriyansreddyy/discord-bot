const Discord = require('discord.js')
const bot = new Discord.Client()

bot.on('ready', async () => {
	console.log(`Logged in as ${bot.user.id}!`)
});

bot.on('guildMemberAdd', async member => {
  const parent = '855011722916790272'
  const channel = await member.guild.channels.create(`welcome-${member.user.discriminator}`, {
    parent
  })
  await channel.send("welcome welcome")
})

bot.on('message', async message => {
  const { channel, author } = message
  if (author.id !== bot.user.id) {
    await channel.send("i hear ya")
  }
})

bot.login('ODU0OTg4MjcyOTAzNzgyNDEw.YMr74Q.KUDrUKjSdqczN0SWdTKzB3wAsxc')

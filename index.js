const Discord = require('discord.js')
const bot = new Discord.Client()

bot.on('ready', () => {
	console.log(`Logged in as ${bot.user.id}!`)
});

bot.on('guildMemberAdd', async member => {
  const channel = await member.guild.channels.create(`welcome-${member.user.discriminator}`)
  await channel.send("welcome welcome")
})

bot.on('message', async message => {
  const { channel, author } = message
  if (author.id !== bot.user.id) {
    await channel.send("i hear ya")
  }
})

bot.login('ODU0OTg4MjcyOTAzNzgyNDEw.YMr74Q.KUDrUKjSdqczN0SWdTKzB3wAsxc')

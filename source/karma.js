const knexConfig = require('./knexfile')
const knex = require('knex')(knexConfig)
const { MessageEmbed } = require('discord.js')

const { KARMA_NOTIFICATIONS_CHANNEL_ID } = process.env

const karma = bot => {

  bot.on('ready', () => {
    const guild = bot.guilds.cache.get("868130358640668713")
    const commands = guild.commands
    commands.create({
      name: 'karma',
      description: 'Tells you how much karma you have'
    })
    commands.create({
      name: 'leaderboard',
      description: 'Tells you who has the most reputation'
    })
  })

  bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) { return }
    const {commandName} = interaction
    if (commandName === 'karma') {
      // interaction.user.id
      const rows = await knex('reputations')
        .where('to', interaction.user.id)
        .sum('points')
      const count = rows.shift().sum || 0
      interaction.reply({
        content: `You have ${count} reputation. Just ${200 - count} more to unlock a T-shirt`,
        ephemeral: true
      })
    }
  })

  bot.on('messageReactionAdd', async (messageReaction, user) => {
    if (messageReaction.partial) {
      await messageReaction.fetch()
    }
    const { message, emoji } = messageReaction
    const notificationsChannel = await bot
      .channels
      .fetch(KARMA_NOTIFICATIONS_CHANNEL_ID)
    if (user.id !== message.author.id 
      && user.id !== bot.user.id 
      && emoji.name === '💜') {

      const rows1 = await knex('reputations')
        .where({ from: user.id, messageId: message.id })
      if (rows1.length > 0) {
      await notificationsChannel.send(`<@${user.id}> reacted to <@${message.author.id}>'s message but no more points were given lol`)
        return
      }

      await knex('reputations')
        .insert({
          points: 1,
          from: user.id,
          to: message.author.id,
          messageId: message.id
        })
      const rows = await knex('reputations')
        .where('to', message.author.id)
        .sum('points')
      const count = rows.shift().sum || 0 // should never be 0 since this code is only run in response to you getting some reputation in the first place lol
      const exampleEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Scrimba', bot.user.displayAvatarURL(), 'https://discord.js.org')
        .setDescription(`Well done <@${message.author.id}>! <@${user.id}> reacted to your post [post](https://example.com) in <#${message.channel.id}> with 💜 which earned you a point.

You now have ${count} karma!`)
      await notificationsChannel.send({embeds: [exampleEmbed]})
      // await notificationsChannel.send(`<@${user.id}> reacted to <@${message.author.id}>'s message in the <#${message.channel.id}> channel (https://discord.com/channels/684009642984341525/${message.channel.id}/${message.id}) with the ${emoji.name} emoji. <@${message.author.id}> earned +1 point and now has a total of ${count} points. `)
    }
  })
}

module.exports = karma

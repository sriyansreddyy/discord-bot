const knexConfig = require('./knexfile')
const knex = require('knex')(knexConfig)
const { MessageEmbed } = require('discord.js')

const { KARMA_NOTIFICATIONS_CHANNEL_ID } = process.env

const karma = bot => {

  bot.on('ready', () => {
    const guild = bot.guilds.cache.first()
    const commands = guild.commands
    commands.create({
      name: 'karma',
      description: 'Shows you how much karma you\'ve earned'
    })

    commands.create({
      name: 'leaderboard',
      description: 'Shows you the top 20 karma leaderboard'
    })
  })

  bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) { 
      return 
    }

    const { commandName } = interaction

    if (commandName === 'karma') {
      const rows = await knex('reputations')
        .where('to', interaction.user.id)
        .sum('points')
      const count = rows.shift().sum || 0
      interaction.reply({
        content: `You have ${count} reputation. Just ${250 - count} more to unlock a hoodie`,
        ephemeral: true
      })
      return
    }

    if (commandName === 'leaderboard') {
      const rows = await knex('reputations')
        .select('to')
        .sum({ totalPoints: 'points' })
        .groupBy('to')
        .orderBy('totalPoints', 'DESC')
        .limit(20)
      const leaderboardText = rows.reduce((prev, current, currentIndex) => {
        return prev += `${currentIndex + 1}. <@${current.to}> has ${current.totalPoints} points\n`
      }, '')
      interaction.reply({
        content: `.: Leaderboard :. \n\n${leaderboardText}`,
        ephemeral: true
      })
    }
  })

  bot.on('messageReactionAdd', async (messageReaction, user) => {
    if (messageReaction.partial) {
      await messageReaction.fetch()
    }

    const { message, emoji } = messageReaction

    const reactionChannel = await bot
      .channels
      .fetch(message.channelId)
    if (!reactionChannel.name.endsWith("-help")) {
      return
    }

    const notificationsChannel = await bot
      .channels
      .fetch(KARMA_NOTIFICATIONS_CHANNEL_ID)

    if (user.id !== message.author.id 
      && user.id !== bot.user.id 
      && emoji.name === '💜') {

      const karmaInteractions = await knex('reputations')
        .where({ 
          from: user.id,
          messageId: message.id 
        })
      if (karmaInteractions.length > 0) {
        // this user has already given karma for this
        // message
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
      const count = rows.shift().sum || 0 //  should never be 0 since to get here the INSERT command above was run but feels better to have it 
      const embed = new MessageEmbed()
        .setColor('#C580F2')
        .setAuthor('Pumpkin from Scrimba', bot.user.displayAvatarURL())
        .setDescription(`Well done <@${message.author.id}>! <@${user.id}> reacted to your post [post](https://discord.com/channels/684009642984341525/${message.channel.id}/${message.id}) in <#${message.channel.id}> with 💜 which earned you a point.

You now have ${count} karma! To see your karma anytime type \`/karma\``)
      await notificationsChannel.send({ embeds: [embed] })
    }
  })
}

module.exports = karma

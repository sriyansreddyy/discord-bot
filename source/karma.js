const { MessageEmbed } = require('discord.js');

const karma = (bot, knex) => {
  const { KARMA_NOTIFICATIONS_CHANNEL_ID } = process.env

  bot.on('messageReactionAdd', async (messageReaction, user) => {
    if (messageReaction.partial) {
      await messageReaction.fetch()
    }
    const { message, emoji } = messageReaction
    const reactionChannel = await bot
      .channels
      .fetch(message.channelId)
    console.log(reactionChannel.name)
    if (!reactionChannel.name.endsWith("-help")) {
      return
    }
    const notificationsChannel = await bot
      .channels
      .fetch(KARMA_NOTIFICATIONS_CHANNEL_ID)
    if (user.id !== message.author.id 
      && user.id !== bot.user.id 
      && emoji.name === '💜') {

      const rows1 = await knex('reputations')
        .where({ from: user.id, messageId: message.id })
      if (rows1.length > 0) {
        // this specific user already voted on this specific
        // post so this is no bueno!
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
        .setColor('#C580F2')
        .setAuthor('Pumpkin from Scrimba', bot.user.displayAvatarURL(), 'https://discord.js.org')
        .setDescription(`Well done <@${message.author.id}>! <@${user.id}> reacted to your post [post](https://discord.com/channels/684009642984341525/${message.channel.id}/${message.id}) in <#${message.channel.id}> with 💜 which earned you a point.

You now have ${count} karma! To see your karma anytime type \`/karma\``)
      await notificationsChannel.send({embeds: [exampleEmbed]})
    }
  })
}

module.exports = karma

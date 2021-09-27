// what if someone removes the reaction then adds it a lot?
// should I save the message in the database? - why?
// should it be throttled?
// how do I show someone their reputation points?
//  by adding a command in the short-term
//  leaderboard
//  awards

const karma = (bot, knex) => {
  console.log('knex', knex)
  const NOTIFICATIONS_CHANNEL_ID = '868130359106207844'
  bot.on('messageReactionAdd', async (messageReaction, user) => {
    if (messageReaction.partial) {
      await messageReaction.fetch()
    }
    const { message, emoji } = messageReaction
    console.log(message)
    const notificationsChannel = await bot
      .channels
      .fetch(NOTIFICATIONS_CHANNEL_ID)
    if (user.id !== message.author.id 
      && user.id !== bot.user.id 
      && emoji.name === '💯') {

      // const reputation = await

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
      const count = rows.shift().sum
      console.log("count", count)
      await notificationsChannel.send(`<@${user.id}> reacted to <@${message.author.id}>'s message in the <#${message.channel.id}> channel (https://discord.com/channels/684009642984341525/${message.channel.id}/${message.id}) with the ${emoji.name} emoji. <@${message.author.id}> earned +1 point and now has a total of ${count} points. `)
    }
  })
}

module.exports = karma

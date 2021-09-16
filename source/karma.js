const karma = bot => {
  const NOTIFICATIONS_CHANNEL_ID = '888143560673747044'
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
      await notificationsChannel.send(`<@${user.id}> reacted to <@${message.author.id}>'s message in the <#${message.channel.id}> channel (https://discord.com/channels/684009642984341525/${message.channel.id}/${message.id}) with the ${emoji.name} emoji. <@${message.author.id}> earned +1 point and now has a total of 0 points. `)
    }
  })
}

module.exports = karma

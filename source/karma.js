const karma = bot => {
  const NOTIFICATIONS_CHANNEL_ID = '888143560673747044'
  bot.on('messageReactionAdd', async (messageReaction, user) => {
    if (messageReaction.partial) {
      await messageReaction.fetch()
    }
    const { message, emoji } = messageReaction
    const notificationsChannel = await bot
      .channels
      .fetch(NOTIFICATIONS_CHANNEL_ID)
    if (user.id !== message.author.id && emoji.name === '💯') {
      await notificationsChannel.send(`<@${user.id}> reacted to <@${message.author.id}>'s message with the ${emoji.name} emoji. <@${message.author.id}> earned +1 point`)
    }
  })
}

module.exports = karma

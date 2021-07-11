require('dotenv').config()

const { Client } = require('discord.js')
const { Pool } = require('pg')

const bot = new Client({ 
  partials: ['MESSAGE', 'REACTION']
})

const WELCOME_PREFIX = '👋welcome-'
const { 
  ONBOARDING_CATEGORY_ID,
  EVERYONE_ROLE_ID,
  REGULAR_MEMBER_ROLE_ID,
  DISCORD_BOT_TOKEN,
  PG_URI 
} = process.env

const pool = new Pool({
  connectionString: PG_URI
})

const steps = [
  {
    question: "Welcome to the Scrimba Discord! What should we call you?",
    help: "❌ Hello <@812310101426831361>, what should I call you? Write below and press enter and you'll be on your way!",
    validate: answer => {
      if (answer.includes(' ')) {
        return `You wrote "${answer}" but that includes a space! What is your *first* name, please?`
      }
    },
    process: async (answer, member) => await member.setNickname(answer),
    processImmediately: true
  }, 
  {
    help: "❌ we need to know your avatar for these reasons blah blah",
    shouldSkip: member => member.user.avatar,
    question: 'Hi, I noticed you don\'t have an avatar. Please set one',
    process: async (answer, member, channel) => {
      await channel.overwritePermissions([
        {
          id: EVERYONE_ROLE_ID,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: member.id,
          allow: ['VIEW_CHANNEL'],
          deny: ['SEND_MESSAGES']
        }
      ])
      return new Promise(resolve => {
        const interval = setInterval(async () => {
          if (member.user.avatar) {
            await channel.overwritePermissions([
              {
                id: EVERYONE_ROLE_ID,
                deny: ['VIEW_CHANNEL']
              },
              {
                id: member.id,
                allow: ['VIEW_CHANNEL']
              }
            ])
            resolve()
            clearInterval(interval)
          }
        }, 1000)
      })
    },
    processImmediately: true
  },
  {
    shouldSkip: () => true,
    // shouldSkip: async member => await findScrimbaUserByDiscordId(member.user.id),
    question: `Fantastic. To access the sever, please click this
    link to connect your Scrimba account: https://scrimba.com/discord/connect`,
    process: (answer, member, channel) => fetchScrimbaUser(member.id, channel),
    processImmediately: true,
  },
  {
    help: '❌ sorry you need to click the emoji',
    question: 'Watch this then https://youtu.be/lPIi430q5fk respond with the ✅',
    expectedReaction: '✅'
  }
]

bot.on('ready', async () => {
  console.log(`Logged in as ${bot.user.id}!`)
  startBeingHelpful()
})

bot.on('guildMemberAdd', async member => {
  const channel = await member
    .guild
    .channels
    .create(`${WELCOME_PREFIX}${member.user.username}_${member.user.discriminator}`, {
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

  const firstStep = steps[0]
  await channel.send(firstStep.question)
})

const findCurrentStep = async channel => {
  const messages = await channel.messages.fetch()
  const botMessages = messages
    .filter(message => message.author.id === bot.user.id)
    .filter(message => !message.content.includes('❌'))
  const botMessage = botMessages.first()
  const question = botMessage.content
  const index = steps.findIndex(step => step.question === question)
  const step = steps[index]
  return { step, index, botMessage}
}

const sendNextStep = async (
  currentStepIndex,
  channel,
  member
) => {
  currentStepIndex += 1
  const nextStep = steps[currentStepIndex]

  if (nextStep) {
    const shouldSkip = await nextStep.shouldSkip?.(member)
    if (shouldSkip) {
      await sendNextStep(currentStepIndex, channel, member)
      return
    }

    const message = await channel.send(nextStep.question)
    if(nextStep.expectedReaction) {
      await message.react(nextStep.expectedReaction)
    }

    if (nextStep.processImmediately) {
      await processAnswer(nextStep, currentStepIndex, channel, member, '')
    }
  } else {
    await assignRegularMemberRole(member)
    await cleanup(channel)
    await sendWelcomeDirectMessage(member)
  }
}

const processAnswer = async (
  currentStep,
  currentStepIndex,
  channel,
  member,
  answer) => {
  const error = currentStep.validate?.(answer, member)
  if (error) {
    await channel.send(`❌ ${error}`)
    return
  }
  await currentStep.process?.(answer, member, channel)
  await sendNextStep(currentStepIndex, channel, member)
}

bot.on('message', async message => {
  const { 
    channel,
    author,
    content: answer,
    member
  } = message

  if (channel.type !== "text" || !channel.name.startsWith(WELCOME_PREFIX)) {
    return
  }

  const onboardee = channel.name.split("-")[1]
  const sender = `${author.username}_${author.discriminator}`

  if (sender !== onboardee) {
    return
  }
  const { step, index } = await findCurrentStep(channel)
  if (answer.toLowerCase() === "help") {
    await channel.send(step.help)
    return
  }
  await processAnswer(step, index, channel, member, answer)
})

bot.on('messageReactionAdd', async (messageReaction, user) => {
  const { 
    message: { channel },
    emoji : { name: answer }
  } = messageReaction

  if (channel.type !== "text" && !channel.name.startsWith(WELCOME_PREFIX)) {
    return
  }
  
  if (user.id === bot.user.id) {
    return
  }

  const onboardee = channel.name.split("-")[1]
  const reactor = `${user.username}_${user.discriminator}`

  if (reactor === onboardee) {
    const { step, index, botMessage } = await findCurrentStep(channel)

    if (step.expectedReaction && step.expectedReaction !== answer)  {
      await botMessage.reply(`❌ you reacted with ${answer} but we were looking for ${step.expectedReaction}`)
      return
    }

    const member = messageReaction
      .message
      .guild
      .members
      .cache
      .find(member => member.id === user.id)
    await processAnswer(step, index, channel, member, answer)
  }
})

const assignRegularMemberRole = member =>  member.roles.add(REGULAR_MEMBER_ROLE_ID)

const sendWelcomeDirectMessage = member => member.send('hi')

const findScrimbaUserByDiscordId = async (discordId) => {
  const { rows }  = await pool
    .query(`SELECT * 
          FROM USERS 
          WHERE discord_id = '${discordId}'`)
  const user = rows[0]
  return user
}
const fetchScrimbaUser = async (discordId, channel) => {
  await channel.overwritePermissions([
    {
      id: EVERYONE_ROLE_ID,
      deny: ['VIEW_CHANNEL']
    },
    {
      id: discordId,
      allow: ['VIEW_CHANNEL'],
      deny: ['SEND_MESSAGES']
    }
  ])
  return new Promise(resolve => {
    const interval = setInterval(async () => {
      const user = await findScrimbaUserByDiscordId(discordId)
      if (user) {
        await channel.overwritePermissions([
          {
            id: EVERYONE_ROLE_ID,
            deny: ['VIEW_CHANNEL']
          },
          {
            id: discordId,
            allow: ['VIEW_CHANNEL']
          }
        ])
        resolve()
        clearInterval(interval)
      }
    }, 1000)
  })
}

const cleanup = channel => channel.delete()
bot.login(DISCORD_BOT_TOKEN)

const beHelpful = async channel => {
  console.log('beHelpful()')
  const { step, botMessage } = await findCurrentStep(channel)
  const onboardee = channel.name.split("-")[1]
  console.log(onboardee)

  const millisecondsSinceQuestion = ((new Date()) - botMessage.createdAt)

  console.log('millisecondsSinceQuestion', millisecondsSinceQuestion)
  const messages = await channel.messages.fetch()

  // if (millisecondsSinceQuestion >= 20000) {
  //   // await cleanup(channel)
  //   return
  // }

  if (millisecondsSinceQuestion >= 30000) {
    const help = `We haven't heard from you in ${millisecondsSinceQuestion} imilliseconds it's time to delete the channel`
    if (!messages.some(message => message.content === help)) {
      await channel.send(help)
    }  
  }

  if (millisecondsSinceQuestion >= 15000) {
    const help = { step }
    if (!messages.some(message => message.content === help)) {
      await channel.send(help)
    }  
  }

  // const ago = ((new Date()) - botMessage.createdAt)
  // could check if this specific error has been sent
  // could check what the most recent error is
  // what if they get stuck on a future step? - could
  // include question the message


  // // const moreThanThirtySecondsAgo = ((new Date()) - botMessage.createdAt) > INTERVAL
  // if (moreThanThirtySecondsAgo) {
  //   const help = step.help || '❌ you ok der?'
  //   const messages = await channel
  //     .messages
  //     .fetch()
  //   console.log('messages', messages)
  //   const some = messages
  //     .some(message => message.content === help)
  //   // if (some && message.sent > THREE_SECONDS * 2) {
  //   //   console.log('already been helped')
  //   // }
  //   await channel.send(help)
  // }
}

const INTERVAL = 5000
const startBeingHelpful = () => {
  setInterval(() => {
    bot
      .channels
      .cache
      .filter(channel => channel.name?.startsWith(WELCOME_PREFIX))
      .forEach(beHelpful)
  }, INTERVAL)

}

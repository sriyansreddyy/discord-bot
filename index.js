require('dotenv').config()

const { Client } = require('discord.js')
const { Pool } = require('pg')

const bot = new Client({ 
  partials: ['MESSAGE', 'REACTION']
})

const WELCOME_PREFIX = '👋welcome-'
const { ONBOARDING_CATEGORY_ID, EVERYONE_ROLE_ID, REGULAR_MEMBER_ROLE_ID, TOKEN, PG_URI } = process.env

const pool = new Pool({
  connectionString: PG_URI
})

const steps = [
  {
    question: "Welcome to the Scrimba Discord! What should we call you?",
    validate: answer => {
      if (answer.includes(' ')) {
        return `You wrote "${answer}" but that includes a space! What is your *first* name, please?`
      }
    },
    process: async (answer, member) => await member.setNickname(answer)
  }, 
  {
    shouldSkip: member => member.user.avatar,
    validate: (answer, member) => {
      if (answer !== "OK") {
        return "you didn not write OK"
      }
      if (!member.user.avatar) {
        return "you wrote OK but you haven't set an avatar yet!"
      }
    },
    question: 'Hi, I noticed you don\'t have an avatar. Please set one then type OK'
  },
  {
    shouldSkip: async member => await findScrimbaUserByDiscordId(member.user.id),
    question: `Fantastic. To access the sever, please click this
    link to connect your Scrimba account: https://scrimba.com/discord/connect`,
    process: (answer, member, channel) => fetchScrimbaUser(member.id, channel),
    processImmediately: true,
  },
  {
    question: 'Watch this then https://youtu.be/lPIi430q5fk respond with the ✅',
    expectedReaction: '✅'
  }
]

bot.on('ready', async () => {
  console.log(`Logged in as ${bot.user.id}!`)
});

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
    .filter(message => !message.content.startsWith('❌'))
  const question = botMessages.first().content
  const index = steps.findIndex(step => step.question === question)
  const step = steps[index]
  return { step, index }
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

  if (sender === onboardee) {
    const { step, index } = await findCurrentStep(channel)
    await processAnswer(step, index, channel, member, answer)
  }
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
    const { step, index } = await findCurrentStep(channel)

    if (step.expectedReaction && step.expectedReaction !== answer)  {
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
bot.login(TOKEN)

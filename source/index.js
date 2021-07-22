require('dotenv').config()

const { Client, Permissions } = require('discord.js')
const { Pool } = require('pg')

const bot = new Client({ 
  partials: ['MESSAGE', 'REACTION']
})

const MILLISECONDS_BEFORE_OFFERING_HELP = 30000
const MILLISECONDS_BEFORE_KICK_WARNING = 60000
const MILLISECONDS_BEFORE_KICKING = 80000

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

const extractOnboardeeIdFromChannelName = channelName => channelName.split('_')[1]

const getOnboardeeFromChannel = channel => {
  const guild = bot.guilds.cache.first()
  const onboardeeId = extractOnboardeeIdFromChannelName(channel.name)
  const onboardee = guild
    .members
    .cache
    .find(member => member.id === onboardeeId)
  return onboardee
}

const steps = [
  {
    question: `Welcome to the Scrimba Discord 👋! This is a coding community for Scrimba users and aspiring web developers. 

Right now, you can only see a couple of channels 😢. There are *a lot* more channels to see! You'll unlock access in just a moment but first, please complete the onboarding.

To get this party started, **what is your first name?**`,
    help: `it's been a few minutes and I still don't know your name 👉🥺👈.

If something is the matter, message <@425243762151915523>; otherwise, please write your name below and press ENTER to continue.`,
    validate: answer => {
      if (answer.includes(' ')) {
        return `you wrote "${answer}" but that answer includes a space. What is your *first* name, please?`
      }
    },
    process: async (answer, member) => await member.setNickname(answer)
  }, 
  {
    help: "**Please take a moment to set a Discord profile piture**. Not sure how? Check out this article, https://www.businessinsider.com/how-to-change-discord-picture?r=US&IR=T",
    shouldSkip: member => member.user.avatar,
    question: `Hold up a second ✋ Please take a moment to set a Discord profile picture - it makes the communication feel more personal.  https://i.imgur.com/MiS7VB5.png

When you set your Discord profile picture, you will automatically proceed to the next step.`,
    process: async (answer, member, channel) => {
      await disableInput(channel, member.id)
      return new Promise(resolve => {
        const interval = setInterval(async () => {
          if (member.user.avatar) {
            await enableInput(channel, member.id)
            resolve()
            clearInterval(interval)
          }
        }, 1000)
      })
    },
    processImmediately: true
  },
  {
    shouldSkip: async member => {
      // console.log('shouldSkip?')
      // return await findScrimbaUserByDiscordId(member.user.id)
      return true
    },
    question: `Fantastik 🎉🇳🇴!

Next, please take a moment to connect your Scrimba and Discord accounts: https://scrimba.com/discord/connect

When you click **Authorize**, you will automatically proceed to the next step.`,
    process: (answer, member, channel) => fetchScrimbaUser(member.id, channel),
    processImmediately: true,
  },
  {
    question: `Are as good at centring CSS elements as you are onboarding 🤩? Nicely done 👍!

We made a video to welcome you to the community and tell you about our community values: https://youtu.be/lPIi430q5fk

To complete the onboarding and unlock the Scrimba Discord server in all it's glory, **react to this message with the ✅ emoji if you agree to uphold our community values**.`,
    expectedReaction: '✅'
  }
]

const foo = () => {
  bot
    .channels
    .cache
    .filter(channel => channel.name?.startsWith(WELCOME_PREFIX))
    .forEach(async channel => {
      const member = getOnboardeeFromChannel(channel)
      if (!member) {
        // they probably left the server
        console.log('member left between restart, deleting channel')
        await cleanup(channel)
        return
      }
      const { step, index } = await findCurrentStep(channel)
      console.log("step", step)
      if(step.processImmediately) {
        await processAnswer(step, index, channel, member, '')
      }
    })
}

bot.on('ready', async () => {
  console.log(`Logged in as ${bot.user.id}!`)
  startBeingHelpful()
  foo()
})

bot.on('guildMemberRemove', async member => {
  const channel = bot
    .channels
    .cache
    .find(channel => channel.name?.startsWith(WELCOME_PREFIX) && extractOnboardeeIdFromChannelName(channel.name) === member.id)
  if (channel) {
    await cleanup(channel)
  }
})

bot.on('guildMemberAdd', async member => {
  const channel = await member
    .guild
    .channels
    .create(`${WELCOME_PREFIX}${member.user.username}_${member.user.id}`, {
      parent: ONBOARDING_CATEGORY_ID,
      permissionOverwrites: [
        {
          id: member.id,
          allow: ['VIEW_CHANNEL']
        },
        {
          id: EVERYONE_ROLE_ID,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: bot.user.id,
          allow: ['VIEW_CHANNEL']
        }
      ]
    })

  const firstStep = steps[0]
  try {
    await channel.send(firstStep.question)
  } catch (error) {
    console.error("error onGuildMemberAdd", error)
  }
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

const disableInput = async (channel, memberId) => {
  await channel.overwritePermissions([
    {
      id: EVERYONE_ROLE_ID,
      deny: ['VIEW_CHANNEL']
    },
    {
      id: memberId,
      allow: ['VIEW_CHANNEL'],
      deny: ['SEND_MESSAGES']
    },
    {
      id: bot.user.id,
      allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS', 'ADD_REACTIONS']
    }
  ])
}

const enableInput = async (channel, memberId) => {
  await channel.overwritePermissions([
    {
      id: EVERYONE_ROLE_ID,
      deny: ['VIEW_CHANNEL']
    },
    {
      id: memberId,
      allow: ['VIEW_CHANNEL']
    },
    {
      id: bot.user.id,
      allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS', 'ADD_REACTIONS']
    }
  ])
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
      await disableInput(channel, member.id)
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
    await channel.send(createError(error, channel))
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

  const onboardee = extractOnboardeeIdFromChannelName(channel.name)
  const sender = author.id

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

  const onboardee = extractOnboardeeIdFromChannelName(channel.name)
  const reactor = user.id

  if (reactor === onboardee) {
    const { step, index } = await findCurrentStep(channel)

    if (step.expectedReaction && step.expectedReaction !== answer)  {
      await channel.send(createError(`you reacted with ${answer} but we were looking for ${step.expectedReaction}`, channel))
      return
    }

    await enableInput(channel, user.id)
    const member = getOnboardeeFromChannel(channel)
    await processAnswer(step, index, channel, member, answer)
  }
})

const assignRegularMemberRole = async member =>  {
  try {
    await member.roles.add(REGULAR_MEMBER_ROLE_ID)
  } catch (error) {
    console.error("error assignRegularMemberRole", error)
    console.log("Are you sure the bot's role is higher than REGULAR_MEMBER_ROLE_ID in the role list?")
  }
}

const sendWelcomeDirectMessage = member => member.send('hi')

const findScrimbaUserByDiscordId = async (discordId) => {
  try {
    const { rows }  = await pool
      .query(`SELECT 
              u.id, 
              s.active
            FROM USERS AS u
            LEFT JOIN subscriptions AS s ON u.id = s.uid AND s.active = true
            WHERE u.discord_id = '${discordId}'`)
    const user = rows[0]
    console.log('user', user)
    return user
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

const fetchScrimbaUser = async (discordId, channel) => {
  console.log('fetchScrimbaUser')
  await disableInput(channel, discordId)
  return new Promise(resolve => {
    const interval = setInterval(async () => {
      const user = await findScrimbaUserByDiscordId(discordId)
      if (user) {
        if (user.subscription.active === 'true') {
          // todo assign badge
          console.log('user is a pro member - give em a badge')
        }
        await enableInput(channel, discordId)
        resolve()
        clearInterval(interval)
      }
    }, 1000)
  })
}

const cleanup = channel => channel.delete()
bot.login(DISCORD_BOT_TOKEN)

const beHelpful = async channel => {
  // might need to check if channel exists(might have been
  // deleted within a few seconds)
  const { step, botMessage } = await findCurrentStep(channel)
  const now = new Date()
  const millisecondsSinceQuestion = now - botMessage.createdAt
  const messages = await channel
    .messages
    .fetch()
  const messagesSinceQuestion = messages.filter(message => message.createdAt > botMessage.createdAt)
  console.log("milliseconds since question", millisecondsSinceQuestion)

  if (millisecondsSinceQuestion >= MILLISECONDS_BEFORE_KICKING) {
    const member = getOnboardeeFromChannel(channel)
    await member.kick()
    return
  }

  if (millisecondsSinceQuestion >= MILLISECONDS_BEFORE_KICK_WARNING) {
    const error = createError(`you've been on this step for quite some time (${MILLISECONDS_BEFORE_KICK_WARNING} milliseconds).

If you're still on this step in ${MILLISECONDS_BEFORE_KICKING - MILLISECONDS_BEFORE_KICK_WARNING} milliseconds, I will remove you from the server. Don't worry! You an always join again and attempt the onboarding.`, channel)
    if (!messagesSinceQuestion.some(message => message.content === error)) {
      await channel.send(error)
    }  
    return
  }

  if (step.help && millisecondsSinceQuestion >= MILLISECONDS_BEFORE_OFFERING_HELP) {
    const error = createError(step.help, channel)
    if (!messagesSinceQuestion.some(message => message.content === error)) {
      await channel.send(error)
    }  
  }
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

const createError = (text, channel) => {
  if (channel){
    const onboardeeId = extractOnboardeeIdFromChannelName(channel.name)
    return `❌ <@${onboardeeId}>, ${text}`
  }
  return `❌ ${text}`
}

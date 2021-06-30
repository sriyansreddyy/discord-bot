require('dotenv').config()

const { Client } = require('discord.js')
const { Pool } = require('pg')

const bot = new Client({ 
  partials: ['MESSAGE', 'REACTION']
})

const WELCOME_PREFIX = '👋welcome-'
const ONBOARDING_CATEGORY_ID = '857924654903984168'
const EVERYONE_ROLE_ID = '837036811825840129'
const REGULAR_MEMBER_ROLE_ID = '855434174151262238'

const pool = new Pool({
  connectionString: process.env.PG_URI
})

const steps = [
  {
    question: "Welcome to the Scrimba Discord! What should we call you?",
    validate: message => {
      if (message.includes(' ')) {
        return `You wrote "${message}" but that includes a space! What is your *first* name, please?`
      }
    },
    process: async (answer, member) => await member.setNickname(answer)
  },
  {
    shouldSkip: () => true,
    // todo: inform someone who found Discord before Scrimba
    // what Scrimba is about and how to make an account
    question: `Fantastic. To access the sever, please click this
    link to connect your Scrimba account: https://scrimba.com/discord/connect`,
    process: (answer, member, channel) => fetchScrimbaUser(member.id, channel),
    processImmediately: true,
  },
  {
    question: 'Watch this then https://youtu.be/lPIi430q5fk respond with the ✅',
    reaction: '✅',
    process: () => console.log('process emojiii')
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

const findStep = async channel => {
  const messages = await channel.messages.fetch()
  const botMessages = messages
    .filter(message => message.author.id === bot.user.id)
    .filter(message => !message.content.startsWith('❌'))
  const question = botMessages.first().content
  const index = steps.findIndex(step => step.question === question)
  const step = steps[index]
  return { step, index }
}

const handle = async (
  step,
  index,
  channel,
  member,
  answer) => {

  const error = step.validate?.(answer)
  if (error) {
    await channel.send(`❌ ${error}`)
    return
  }
  await step.process(answer, member, channel)

  index += 1
  const nextStep = steps[index]

  if (nextStep) {

    const shouldSkip = nextStep.shouldSkip?.()
    if (shouldSkip) {
      console.log(`i should be skipping ${nextStep.question} this but oh well`)
      // BIG TODO: need to go up a few lines and run this
      // again without the step BUT i don't intend to
      // process the step or do inptu validation since we're
      // skipping the step ARGH
    }

    const message = await channel.send(nextStep.question)
    if(nextStep.reaction) {
      await message.react(nextStep.reaction)
    }

    if (nextStep.processImmediately) {
      await handle(nextStep, index, channel, member, answer)
    }
  } else {
    await assignRegularMemberRole(member)
    await cleanup(channel)
    await sendWelcomeDirectMessage(member)
  }
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
    const { step, index } = await findStep(channel)
    await handle(step, index, channel, member, answer)
  }
})

bot.on('messageReactionAdd', async (messageReaction, user) => {
  const { 
    // partial,
    message: { channel },
    emoji 
  } = messageReaction

  // if (partial) {
  //   // TODO: process partial messages if needed
  //   console.error('partial', partial)
  //   // await messageReaction.fetch()
  // }

  if (user.id === bot.user.id) {
    return
  }

  if (channel.type === "text" && channel.name.startsWith(WELCOME_PREFIX)) {
    const onboardee = channel.name.split("-")[1]
    const reactor = `${user.username}_${user.discriminator}`

    if (reactor === onboardee) {
      const { step, index } = await findStep(channel)
      const answer = emoji.name

      if (step.reaction && step.reaction !== answer)  {
        return
      }

      // messageReactionAdd only gives us a user so we need
      // to find the guild member
      const member = messageReaction.message.guild.members.cache.find(member => member.id === user.id)
      await handle(step, index, channel, member, answer)
    }
  }
})

const assignRegularMemberRole = member =>  member.roles.add(REGULAR_MEMBER_ROLE_ID)

const sendWelcomeDirectMessage = member => member.send('hi')

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
      const { rows }  = await pool
        .query(`SELECT * 
          FROM USERS 
          WHERE discord_id = '${discordId}'`)
      const user = rows[0]
      if (user) {
        await channel.overwritePermissions([
          {
            id: EVERYONE_ROLE_ID,
            deny: ['VIEW_CHANNEL']
          },
          {
            id: discordId,
            allow: ['VIEW_CHANNEL']
            // deny: ['SEND_MESSAGES']
          }
        ])
        resolve()
        clearInterval(interval)
      }
    }, 1000)
  })
}

const cleanup = channel => channel.delete()
bot.login(process.env.TOKEN)

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
    question: `Fantastic. To access the sever, please click this
    link to connect your Scrimba account: https://scrimba.com/discord/connect`,
    process: (answer, member, channel) => fetchScrimbaUser(member.id, channel),
    processImmedaitely: true,
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

bot.on('message', async message => {
  const { 
    channel,
    author,
    content: answer,
    member
  } = message
  if (channel.type === "text" 
    && channel.name.startsWith(WELCOME_PREFIX)) {
    const onboardee = channel.name.split("-")[1]
    console.log('author.username', author.username)
    const sender = `${author.username}_${author.discriminator}`
    if (sender === onboardee) {
      const messages = await channel.messages.fetch()
      const botMessages = messages
        .filter(message => message.author.id === bot.user.id)
        .filter(message => !message.content.startsWith('❌'))
      const question = botMessages.first().content

      const answers = { }
      answers[question] = answer
      
      const index = steps.findIndex(step => step.question === question)
      const step = steps[index]

      const error = step.validate?.(answer)
      if (error) {
        await channel.send(`❌ ${error}`)
        return
      }

      await step.process(answer, member, channel)
      const nextStep = steps[index + 1]

      if (nextStep) {
        const message = await channel.send(nextStep.question)
        if(nextStep.reaction) {
          await message.react(nextStep.reaction)
        }
        if (nextStep.processImmedaitely) {
          // this is ridic
          await nextStep.process(answer, member, channel)
          const nextNextStep = steps[index + 2]
          const message = await channel.send(nextNextStep.question)
          if(nextNextStep.reaction) {
            await message.react(nextNextStep.reaction)
          }
        }
      } else {
        await assignRegularMemberRole(member)
        await cleanup(channel)
        await sendWelcomeDirectMessage(member)
      }

    }
  }
})

bot.on('messageReactionAdd', async (messageReaction, user) => {
  const { 
    partial,
    message,
    emoji 
  } = messageReaction
  const { channel}  = message

  if (partial) {
    // TODO: process partial messages if needed
    console.error('partial', partial)
    // await messageReaction.fetch()
  }

  if (user.id === bot.user.id) {
    console.log('it\'s just the botty bot')
    return
  }

  if (channel.type === "text" 
    && channel.name.startsWith(WELCOME_PREFIX)) {
    const onboardee = channel.name.split("-")[1]
    const reactor = `${user.username}_${user.discriminator}`
    if (reactor === onboardee) {
      const messages = await channel.messages.fetch()
      const botMessages = messages
        .filter(message => message.author.id === bot.user.id)
      const question = botMessages.first().content

      const answer = emoji.name
      const answers = { }
      answers[question] = answer
      const index = steps.findIndex(step => step.question === question)
      const step = steps[index]

      if (step.reaction && step.reaction !== answer)  {
        return
      }

      await step.process(answer, user)
      const nextStep = steps[index + 1]
      if (nextStep) {
        await channel.send(nextStep.question)
      } else {
        const member = messageReaction
          .message
          .guild
          .members
          .cache
          .find(member => member.id === user.id)
        await assignRegularMemberRole(member)
        await cleanup(channel)
        await sendWelcomeDirectMessage(user)
      }
    }
  }
})

const assignRegularMemberRole = member => member
  .roles
  .add(REGULAR_MEMBER_ROLE_ID)

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

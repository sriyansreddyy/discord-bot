const Discord = require('discord.js')
const bot = new Discord.Client()
const { Pool, Client } = require('pg')
require('dotenv').config()

const WELCOME_PREFIX = 'welcome-'
const ONBOARDING_CATEGORY_ID = '855011722916790272'
const EVERYONE_ROLE_ID = '837036811825840129'
const REGULAR_MEMBER_ROLE_ID = '855434174151262238'

const pool = new Pool({
  connectionString: process.env.PG_URI
})

bot.on('ready', async () => {
  console.log(`Logged in as ${bot.user.id}!`)
});

bot.on('guildMemberAdd', async member => {
  const channel = await member
    .guild
    .channels
    .create(`${WELCOME_PREFIX}${member.user.discriminator}`, {
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


const steps = [
  {
    question: "Welcome to the Scrimba Discord! What should we call you?",
    process: async (answer, member) => await member.setNickname(answer)
  },
  {
    question: `Fantastic. To access the sever, please click this
    link to connect your Scrimba account: https://scrimba.com/discord/connect`,
    process: (answer, member) => checkIfConnectedOnRepeat(member.id)
  }
]

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
    const sender = author.discriminator
    if (sender === onboardee) {

      const messages = await channel.messages.fetch()
      const botMessages = messages
        .filter(message => message.author.id === bot.user.id)
      const question = botMessages.first().content

      const answers = { }
      answers[question] = answer
      
      const index = steps.findIndex(step => step.question === question)
      const step = steps[index]
      await step.process(answer, member)
      const nextStep = steps[index + 1]

      if (nextStep) {
        await channel.send(nextStep.question)
      } else {
        await assignRegularMemberRole(member)
        await cleanup(channel)
        await sendWelcomeDirectMessage(member)
      }

    }
  }
})

const assignRegularMemberRole = (member) => member.roles.add(REGULAR_MEMBER_ROLE_ID)
const cleanup = channel => channel.delete()
const sendWelcomeDirectMessage = member => member.send('hi')

bot.login(process.env.TOKEN)

// const processMember = async discordId => {
//   const { rows }  = await pool.query(`SELECT * FROM USERS WHERE discord_id = '${discordId}'`)
//   const user = rows[0]
//   if (user) {
//     console.log(`${discordId} joined. we already know who this is,`, user)
//   } else {
//     console.log(`${discordId} joined. unknown Scrimba user`, user)
//   }
//   // console.log('rows.length', rows.length)
// }

const checkIfConnectedOnRepeat = async discordId => {
  return new Promise(() => {
    setInterval(() => {
      console.log(`running every second forever to see if ${discordId} is tethere`)
    }, 1000)
  })
}

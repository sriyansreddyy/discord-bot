// * Notes
  // * can have two accounts: one with GitHub OAuth and one with
  //   username/password login (emails are not distinct -
  //   accounts are not merged, nor is the user warned that the
  //   email is "already in use" if they login GitHub) -
  //   clearly problematic
// UX/Concerns
  //   * will users feel like we are asking for their email to
  //   annoy them with marketing emails?
  //   not everyone knows their email - either because they
  //   can't remmeber, don't know which email is associated with
  //   GitHub, or they used a system like frode+scrimba@gmail.com
// scrimba.com/connect


// thinking through the link approach
  // someone can connect their Discord account/user *before*
// ever joining the Scrimba guild


// connect
// look-up a user by their email
  // look-up pro status by their email
// update user record in Scrimba database with their Discord
// ID

require('dotenv').config()

const { Pool, Client } = require('pg')
const pool = new Pool({
  connectionString: process.env.PG_URI
})

// const user = { id: "425243762151915523" }
// pool
//   .query(`SELECT * from USERS where discord_id = '${user.id}'`)
//   .then(res => console.log(res.rows[0]))
//   .catch(e => console.error(e.stack))

// subscriptions https://github.com/scrimba/scrimba-site/blob/master/Documentation/Subscriptions.md
// use active: true

const user = { name: 'Syrians', id: "804279776482820117" }
pool
  .query(`SELECT * 
          FROM users AS u 
          JOIN subscriptions AS s ON u.id = s.uid AND s.active = true
          WHERE u.discord_id = '${user.id}'
          LIMIT 1`)
  .then(res => {
    console.log("rows", res.rows.length)
    // const user = res.rows[0]
    // console.log('user', user)
    // if (user.active) { giveProBadge() } 
  })
  .catch(e => console.error(e.stack))

// pool.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
//   pool.end()
// })
// const client = new Client("discord:badges for everyone!@51.161.84.223:5432/scrimba")
// await client.connect()

// solutions to try:
//   could try connection intead of pool
//
require('dotenv').config()

const DISCORD_ID = '584258569759883298'

const { PG_URI } = process.env

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: PG_URI
})


const test = async () => {
  const connectionPool = await pool.connect()
  console.log('connected')
  connectionPool.on('notification', data => {
    console.log('event fired, finished blocking...')
    console.log('data', data)
  })
  // const { rows }  = await pool
  //   .query(`SELECT * 
  //           FROM USERS 
  //           WHERE discord_id = '${DISCORD_ID}'`)
  // const user = rows[0]

  // console.log('user', user)


  // setup the event listener then resolve
  const res = await connectionPool.query('LISTEN discord_id_updated')
  console.log('res', res)
}

(async () => {
  await test()
  setInterval(function() {
    console.log("timer that keeps nodejs processing running");
  }, 1000 * 60 * 60);
})()

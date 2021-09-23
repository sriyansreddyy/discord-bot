// const pg = require('pg')

const knexConfig = require('./knexfile')['development']
const knex = require('knex')(knexConfig)

knex('reputations')
  .insert({
    from: 'frode',
    to: 'booker'
  })
  .then(rep => {
    console.log('rep', rep)
  })
  .catch(error => {
    console.error('error', error)
  })


// functions I need
  // add reputation point
  // deduct reputation point
// queries I need
  // calculate total reputation
  // calculate total reputation in a given month (could also
  // delete all reputation points in the 1st :grimacing:)

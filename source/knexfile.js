// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : '',
      password : '',
      database : 'discord_bot'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : '',
      password : '',
      database : 'discord_bot'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};

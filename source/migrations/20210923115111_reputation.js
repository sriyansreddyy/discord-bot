
exports.up = function(knex) {
  return knex.schema.createTable('reputations', table => {
    table.increments()
    table.integer('points')
    table.string('from')
    table.string('to')
    table.string('messageId')
    table.timestamps(true, true)
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('reputations')
}

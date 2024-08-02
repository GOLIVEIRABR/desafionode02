import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('diets', (table) => {
    table.uuid('id').primary()
    table.uuid('user_id').unsigned()
    table.foreign('user_id').references('users.id')
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.timestamp('data').notNullable()
    table.boolean('onDiet').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('diets')
}

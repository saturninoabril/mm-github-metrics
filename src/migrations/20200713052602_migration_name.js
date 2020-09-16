exports.up = function (knex) {
    return knex.schema.createTable('commits', function (table) {
        table.increments();
        table.string('hash').notNullable();
        table.string('repo').notNullable();
        table.string('branch').notNullable();
        table.string('author').notNullable();
        table.string('title', 500).notNullable();
        table.timestamp('committed_at').notNullable();
        table.string('compared_to').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('count').notNullable();
        table.integer('e2e').notNullable();
        table.integer('unit').notNullable();
        table.integer('with_test').notNullable();
        table.integer('plus').notNullable();
        table.integer('minus').notNullable();
        table.string('year_week').notNullable();
        table.string('year_month').notNullable();
        table.integer('year').notNullable();
        table.integer('month').notNullable();
        table.integer('week').notNullable();
        table.unique(['hash', 'repo']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('commits');
};

// Update with your config settings.

module.exports = {
    development: {
        client: 'postgresql',
        connection: 'postgres://mmuser:mostest@localhost:5432/mm-gh-metrics?sslmode=disable&connect_timeout=10',
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    },
    production: {
        client: 'postgresql',
        connection: 'postgres://mmuser:mostest@localhost:5432/mm-gh-metrics?sslmode=disable&connect_timeout=10',
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    },
};

exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('google_oauth_tokens', table => {
            table.increments('id').primary();
            table.json('tokens');
            table.timestamp('createdAt').defaultTo(knex.fn.now()).index();
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('google_oauth_tokens')
    ])
};

exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('stories', table => {
            table.increments('id').primary();
            table.string('uuid');
            table.unique('uuid');
            table.string('title');
            table.text('text');
            table.string('audioUrl');
            table.json('marks');
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('stories')
    ])
};

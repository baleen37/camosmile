// const repl = require('repl');

const Knex = require('knex');
const objection = require('objection');
const knexConfig = require('../knexfile');
const knex = Knex(knexConfig.development);
objection.Model.knex(knex);
knex.migrate.latest().then(() => console.log('Migrated.'));
// wait

const Story = require('./models/Story').default;

// const replServer = repl.start('> ');


import knex from 'knex';

const environment = process.env.NODE_ENV || 'development'; // if something else isn't setting ENV, use development
const configuration = require('./knexfile')[environment];
export const knexConnection = knex(configuration);

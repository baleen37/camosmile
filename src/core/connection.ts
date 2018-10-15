import * as knex from 'knex';
import { Model } from 'objection';

export class Connection {
    knex(): knex {
        return knex(exportConfig());
    }

    bindModel(): Connection {
        Model.knex(this.knex());
        return this;
    }
}

function exportConfig(): knex.Config {
    const environment = process.env.NODE_ENV || 'development';
    return require('../../knexfile')[environment];
}

import knex from 'knex';
import { config } from '../config.js';

function getPgKnex() {
    return knex({
        client: 'pg',
        connection: {
            host: config.database.host,
            port: config.database.port,
            user: config.database.user,
            password: config.database.password,
            database: config.database.name
        },
    });
}

export default getPgKnex;
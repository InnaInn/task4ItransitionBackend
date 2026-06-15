import QueryQL from '@truepic/queryql';
import getPgKnex from '../db/postgresConnection.js'
import { uuidv7 } from 'uuidv7';

const pg = getPgKnex();
const Users = () => pg('users');

class UserQuerier extends QueryQL {
    defineSchema(schema) {
        schema.filter('username', 'like');
        schema.filter('email', 'like');
        schema.filter('status', '=');
        schema.sort('username');
        schema.sort('email');
        schema.sort('status');
        schema.sort('last_login');
        schema.page();
    }
}

export const getUsers = async (query) => {
    const querier = new UserQuerier(query, Users());
    return querier.run();
};

export const getUser = async (email, password) => {
    return Users()
        .where({ email: email, password: password })
        .first();
};

export const createUser = async (email, password, username) => {
    const uuid = uuidv7();
    await Users().insert({
        id: uuid,
        username: username,
        password: password,
        email: email,
        status: 'UNVERIFIED'
    });
    return uuid;
}

export const resetPassword = async (email) => {
    const userPassword = uuidv7();

    await Users()
        .where('email', email)
        .update({
            password: userPassword
        });
}

export const deleteUser = async (id) => {
    await Users()
        .where('id', id)
        .delete();
}

export const deleteUnverifiedUsers = async()=> {
    await Users()
     .whereIn('status', ['BLOCKED_UNVERIFIED', 'UNVERIFIED'])
     .delete();
}

export const setUserStatus = async (id, status) => {
    return Users()
        .where('id', id)
        .update({
            status: status
        });
}

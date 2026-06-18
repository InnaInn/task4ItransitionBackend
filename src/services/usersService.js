import QueryQL from '@truepic/queryql';
import getPgKnex from '../db/postgresConnection.js'
import { uuidv7 } from 'uuidv7';
import { sendEmail } from './emailService.js';
import crypto from 'crypto';
import { config } from '../config.js';

const pg = getPgKnex();
const Users = () => pg('users');

function computeSHA3_256(password) {
    return crypto.createHash('sha3-256').update(password).digest('hex');
}


class UserQuerier extends QueryQL {
    defineSchema(schema) {
        schema.filter('username', 'ilike');
        schema.filter('email', 'ilike');
        schema.filter('status', '=');
        schema.sort('username');
        schema.sort('email');
        schema.sort('status');
        schema.sort('last_login');
        schema.page();
    }
}

export const updatelastLoginTime = async (id) => {
    return Users()
        .where('id', id)
        .update({
            last_login: new Date()
        });
};

export const getUsers = async (query) => {
    const querier = new UserQuerier(query, Users());
    return querier.run();
};

export const getUser = async (email, password) => {
    return Users()
        .where({
            email: email,
            password: computeSHA3_256(password)
        })
        .first();
};

export const createUser = async (email, password, username) => {
    const uuid = uuidv7();
    await Users().insert({
        id: uuid,
        username: username,
        password: computeSHA3_256(password),
        email: email,
        status: 'UNVERIFIED'
    });

    sendEmail(email, 'Verify Email Address', `
        <html>
            <body>
                <div>To verify your email, click
                    <a href='${config.server.address}:${config.server.port}/api/users/verify?userId=${uuid}'>HERE</a>
                </div>
            </body>
        </html>`);

    return uuid;
}

export const resetPassword = async (email) => {
    const userPassword = uuidv7();

    await Users()
        .where('email', email)
        .update({
            password: computeSHA3_256(userPassword)
        });
    sendEmail(email, 'Password Reset', `
        <html>
            <body>
                Your new password is ${userPassword}
            </body>
        </html>`);
}

export const deleteUser = async (id) => {
    await Users()
        .where('id', id)
        .delete();
}

export const deleteUnverifiedUsers = async () => {
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




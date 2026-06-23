/*
import nodemailer from "nodemailer";
import { config } from "../config.js";

export function sendEmail(recipient, subject, body) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: config.mail.address,
            pass: config.mail.token
        },
        family: 4,
        connectionTimeout: 5000,    
        greetingTimeout: 5000,      
        socketTimeout: 10000,      
    });

    
    const sendPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            transporter.close();
            reject(new Error('Email sending timeout after 15 seconds'));
        }, 15000);

        transporter.sendMail({
            from: '"User App" <bot.userapp.zamzhytskaya@gmail.com>',
            to: recipient,
            subject: subject,
            html: body
        })
        .then(info => {
            clearTimeout(timeout);
            transporter.close();
            resolve(info);
        })
        .catch(error => {
            clearTimeout(timeout);
            transporter.close();
            reject(error);
        });
    });

    return sendPromise; 
}

*/
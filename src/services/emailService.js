import nodemailer from "nodemailer";
import { config } from "../config.js";

export function sendEmail(recipient, subject, body) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.mail.address,
            pass: config.mail.token
        }
    });

    try {
        transporter.sendMail({
            from: '"User App" <bot.userapp.zamzhytskaya@gmail.com>',
            to: recipient,
            subject: subject,
            html: body
        }).then(info => {
            console.log('Message sent:', JSON.stringify(info));
        });
    } catch (error) {
        console.error('Error:', error);
    }
}
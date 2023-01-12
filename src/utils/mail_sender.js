import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

const MailSender = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

export default MailSender;

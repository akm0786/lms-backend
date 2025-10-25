import nodemailer from "nodemailer";

const sendEmail = async (email, subject, message) => {

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Wrap in an async IIFE so we can use await.
    await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject: subject,
        html: message, // HTML body
    });

}

export default sendEmail
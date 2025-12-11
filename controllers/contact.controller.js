import Contact from "../models/contact.model.js";
import AppError from "../utils/error.util.js";
import dotenv from 'dotenv';
import sendEmail from "../utils/sendEmail.js";
dotenv.config();

const contactController = async (req, res, next) => {
    const { name, email, message } = req.body;
    try {
        if (!name || !email || !message) {

            return next(new AppError('All fields are required', 400));
        }

        // save the data to db
        const contact = await Contact.create({ name, email, message })

        if (!contact) {
            return next(new AppError('Failed to save contact', 500));
        }
        await contact.save();

        const emailMessage = `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong> ${message}</p>
            <p> <strong>Thank you for your submission we will get back to you soon.</strong> </p>
        `;
        await sendEmail(email, 'Contact Form Submission', emailMessage);
        // await sendEmail('test@example.com', 'Test Email', '<p>This is a test</p>');
        res.status(200).json({
            success: true,
            message: 'Message sent successfully and saved to database'
        })

    } catch (error) {
        return next(new AppError('Failed to send email', 500));
    }

}


export default contactController 
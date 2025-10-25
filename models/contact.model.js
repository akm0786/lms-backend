import { Schema, model } from "mongoose";

const contactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        minLength: [5, 'Message must be at least 20 characters long'],
        maxLength: [2000, 'Message must be at most 2000 characters long'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Contact = model('Contact', contactSchema);

export default Contact
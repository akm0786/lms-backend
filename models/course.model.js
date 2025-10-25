import { model, Schema } from 'mongoose';

const courseSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        minLength: [8, 'Title must be at least 8 characters long'],
        maxLength: [60, 'Title must be at most 60 characters long'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minLength: [20, 'Description must be at least 20 characters long'],
        maxLength: [2000, 'Description must be at most 2000 characters long'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    thumbnail: {
        public_id: {
            type: String,
            required: true,
        },
        secure_url: {
            type: String,
            required: true,
        }
    },
    lectures: [
        {
            title: String,
            description: String,
            lecture: {
                public_id: {
                    type: String,
                    required: true
                },
                secure_url: {
                    type: String,
                    required: true
                }
            }
        }
    ],
    numberOfLectures: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    });

const Course = model('Course', courseSchema);

export default Course;
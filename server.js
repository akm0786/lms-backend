import Razorpay from 'razorpay';
import app from './app.js';
import connectionToDB from './config/dbconnection.js';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;

// setup cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const razorpay = new Razorpay({
    key_id: process.env.ROZERPAY_KEY_ID,
    key_secret: process.env.ROZERPAY_SECRET
});


app.listen(PORT, async () => 
    {
        await connectionToDB();
        console.log(`Server started on port ${PORT}`)
    }    
);

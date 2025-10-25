import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import sendEmail from "../utils/sendEmail.js";
dotenv.config();
import crypto from 'crypto';

const cookieOptions = {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true
}

const register = async (req, res, next) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return next(new AppError('All fields are required', 400));
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(new AppError('User Email already exists', 400));
    }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: 'https://res.cloudinary.com/dwpznmri9/image/upload/v1758951937/lms/vzmpbbebexacrgibdlxb.avif?def'
        }
    });

    if (!user) {
        return next(new AppError('User could not be created', 400));
    }

    //  File upload

    // console.log(JSON.stringify(req.file));
    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250,
                height: 250,
                crop: 'fill',
                gravity: 'face'
            });

            if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                // remove the local file after uplaod
                fs.rm(`uploads/${req.file.filename}`);
            }
        } catch (e) {
            return next(new AppError(e || 'File upload failed', 500));
        }
    }
    await user.save();

    user.password = undefined;

    const token = user.generateJWTToken();

    res.cookie('token', token, cookieOptions);

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        user
    });
}

const login = async (req, res) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new AppError('All fields are required', 400));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || await !user.comparePassword(password)) {
            return next(new AppError('Invalid email or password', 400));
        }

        const token = await user.generateJWTToken();
        user.password = undefined;

        res.cookie('token', token, cookieOptions);
        console.log(token);


        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            user
        });
    } catch (e) {
        return next(new AppError('Something went wrong', 500));
    }
}

const logout = (req, res) => {
    res.cookie('token', null, {
        secure: true,
        maxAge: 0,
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
}

const getProfile = async (req, res, next) => {

    try {

        const userId = req.user.id;
        console.log(userId);

        const user = await User.findById(userId);

        res.status(200).json({
            success: true,
            message: 'User Details',
            user
        });
    } catch (e) {
        return next(new AppError('Failed to fetch profile details', 500));
    }

}

const forgotPassword = async (req, res, next) => {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError('User not Registered', 404));
    }

    const resetToken = await user.generatePasswordResetToken();

    await user.save();

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const subject = 'LMS Password Reset';
    const message = `Click <a href="${resetPasswordUrl}">here</a> to reset your password. if this does not work, copy and paste the link ${resetPasswordUrl} into your browser. if you did not request this, please ignore this email.`;

    try {

        await sendEmail(email, subject, message);

        res.status(200).json({
            success: true,
            message: `Reset Email sent to ${email} successfully`
        });
    } catch (e) {
        user.forgetPasswordToken = undefined;
        user.forgetPasswordExpiry = undefined;

        await user.save();
        return next(new AppError('Email could not be sent', 500));
    }


}

const resetPassword = async (req, res, next) => {

    const { resetToken } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
        forgetPasswordToken: hashedToken,
        forgetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = password;
    user.forgetPasswordToken = undefined;
    user.forgetPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successfully'
    });
}

const changePassword = async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return next(new AppError('All fields are required', 400));
    }

    if (await !user.comparePassword(oldPassword)) {
        return next(new AppError('Old password is incorrect', 400));
    }

    user.password = newPassword;
    await user.save();

    user.password = undefined;

    res.status(200).json({
        success: true,
        message: 'Password changed successfully'
    });

}

const updateUser = async (req, res, next) => {

    const { fullName } = req.body;
    const { id } = req.user;
    const user = await User.findById(id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    if (fullName && fullName !== user.fullName) {
        user.fullName = fullName;
    }
    if (req.file) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250,
                height: 250,
                crop: 'fill',
                gravity: 'face'
            });

            if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                // remove the local file after uplaod
                fs.rm(`uploads/${req.file.filename}`);
            }
        } catch (e) {
            return next(new AppError(e || 'File upload failed', 500));
        }

    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'User updated successfully'
    });
}

export { register, login, logout, getProfile, forgotPassword, resetPassword, changePassword, updateUser }; 
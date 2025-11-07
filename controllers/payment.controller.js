import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import AppError from "../utils/error.util.js";

export const getRazorpayApiKey = async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Razorpay api key",
        key: process.env.ROZERPAY_KEY_ID
    })

}
export const buySubscription = async (req, res, next) => {

    try {
        const { id } = req.user;

        const user = await User.findById(id);

        if (!user) {
            return next(new AppError('Unauthorized, Please login', 404));
        }

        if (user.role === 'admin') {
            return next(new AppError('Admin cannot buy subscription', 400));
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env.ROZERPAY_PLAN_ID,
            customer_notify: 1,
        })

        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Subscription created successfully",
            subscription_id: subscription.id
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }

}
export const verifySubscription = async (req, res, next) => {
    try {
        const { id } = req.user;

        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const subscriptionId = user.subscription.id;

        const generatedSignature = crypto
            .createHmac('sha256', process.env.ROZERPAY_SECRET)
            .update(`${razorpay_payment_id} | ${subscriptionId}`)
            .digest('hex');

        if (razorpay_signature !== generatedSignature) {
            return next(new AppError('Payment not verified, try again', 500));
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature
        })
        user.subscription.status = 'active';
        await user.save();

        res.status(200).json({
            success: true,
            message: "Paymentverified successfully!",
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }

}
export const cancelSubscription = async (req, res, next) => {

    try {
        const { id } = req.user;

        const user = await User.findById(id);

        if (!user) {
            return next(new AppError('Unauthorized, Please login '));
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin cannot purchase subscription', 400));
        }

        const subscriptionId = user.subscription.id;

        const subscription = await razorpay.subscriptions.cancel(subscriptionId)

        user.subscription.status = subscription.status;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Subscription cancelled successfully"
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

export const allPayments = async (req, res, next) => {
    try {
        const { count } = req.query;
       const subscriptions = await razorpay.subscriptions.all({
            count: count || 10

        })
        if(!subscriptions || subscriptions.length === 0 || subscriptions === null || subscriptions === undefined) {
            return next(new AppError('Subscriptions not found', 404));
        }
        console.log(subscriptions);

        res.status(200).json({
            success: true,
            message: "All payments",
            subscriptions : subscriptions || []
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }

}

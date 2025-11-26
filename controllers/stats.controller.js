import { razorpay } from "../server.js";
import AppError from "../utils/error.util.js";

export const getMonthlyStats = async (req, res, next) => {

    try {
        const year = req.query.year ? req.query.year : new Date().getFullYear();

        let monthlySalesRecord = Array(12).fill(0);

        for (let month = 0; month < 12; month++) {

            const startMonth = new Date(year, month, 1) / 1000;
            const endMonth = new Date(year, month + 1, 1) / 1000;

            const payments = await razorpay.payments.all({
                from: startMonth,
                to: endMonth,
                count: 100
            })

            const captured = payments.items.filter(payment => payment.status === 'captured')

            const total = captured.reduce((acc, payment) => acc + payment.amount, 0)

            monthlySalesRecord[month] = total / 100

        }

        res.status(200).json({
            success: true,
            message: "Monthly stats fetched successfully",
            monthlySalesRecord: monthlySalesRecord
        })

    }
    catch (e) {
        return next(new AppError(e.message, 500));
    }
}

export const subscribedUsersCount = async (req, res, next) => {
    try {
        const { count } = req.query;
        const subscriptions = await razorpay.subscriptions.all({
            count: count || 10

        })

        const subscribedUsers = (subscriptions.items || []).filter(subscription => subscription.status === 'active');
        // console.log(subscriptions.items);
        res.status(200).json({
            success: true,
            message: "Subscribed users and all users",
            subscribedUsersCount: subscribedUsers.length,
            allUsersCount: subscriptions.count
        })

    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}


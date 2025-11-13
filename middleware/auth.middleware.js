import jwt from 'jsonwebtoken';
import AppError from '../utils/error.util.js';
import User from '../models/user.model.js';
const isLoggedIn = (req, res, next) => {

    try {
        const { token } = req.cookies;

        if (!token) {
            return next(new AppError('You are not logged in', 401));
        }

        const userDetails = jwt.verify(token, process.env.JWT_SECRET);

        req.user = userDetails;

        next();
    } catch (e) {
        return next(new AppError('Something went wrong in middleware', 500));
    }
}

const authorizeRoles = (...roles) => async (req, res, next) => {
    try {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You are not authorized to access this resource', 403));
        }
        next();
    } catch (e) {
        return next(new AppError('Something went wrong in middleware', 500));
    }

}

const authorizedSubscriber = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const subscription = req.user.subscription;
    // const currentUserRole = req.user.role;
    if(user.role !== 'ADMIN' && user.subscription.status !== 'active') {
        return next(new AppError('Please subscribe to access this resource', 403));
    }
    next();
}


export {
    isLoggedIn,
    authorizeRoles,
    authorizedSubscriber
}

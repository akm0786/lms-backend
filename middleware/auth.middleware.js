import jwt from 'jsonwebtoken';
import AppError from '../utils/error.util.js';
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


export {
    isLoggedIn,
    authorizeRoles
}

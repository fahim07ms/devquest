import {sendErrorResponse} from "../utils/error.js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export default function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.accessToken;
        
        if (!token) {
            return sendErrorResponse(
                res,
                401,
                "Unauthorized."
            );
        }
        
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.userId;
        req.role = payload.role;
        
        return next();
    } catch (e) {
        if (process.env.NODE_ENV === 'development') console.log(e);
        return sendErrorResponse(
            res,
            401,
            "Invalid or expired token."
        )
    }
}

// only moderators and admins can access moderation routes
export const moderatorMiddleware = (req, res, next) => {
    if (!req.role || !['moderator', 'admin'].includes(req.role)) {
        return res.status(403).json({ message: 'Moderator access required.' });
    }
    next();
};

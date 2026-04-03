import {sendErrorResponse} from "../utils/error.js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// AuthMiddleware verifies the JWT token and populates req.userId and req.role.
// If token is missing, then return 401 Unauthorized.
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

// Check user role if it is moderator/admin or not
export const moderatorMiddleware = (req, res, next) => {
    if (!req.role || !['moderator', 'admin'].includes(req.role)) {
        return sendErrorResponse(
            res,
            403,
            "Moderator access required."
        );
    }
    next();
};

// Decode the JWT token to get userId and role silently without sending 401 error when failed.
export function optionalAuthMiddleware(req, res, next) {
    try {
        const token = req.cookies.accessToken;
        if (token) {
            const payload = jwt.verify(token, JWT_SECRET);
            req.userId = payload.userId;
            req.role = payload.role;
        }
    } catch (e) {
        // Silently ignore invalid tokens for optional auth
    }
    return next();
}

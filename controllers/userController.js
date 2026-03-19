import authModel from '../models/authModel.js';
import {sendErrorResponse} from "../utils/error.js";

export const getUserDetails = async (req, res) => {
    try {
        const user = await authModel.getUserById(req.userId);
        
        return res.status(200).json({
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    reputationPoints: user.reputationPoints,
                    badgeCount: user.badgeCount,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePicture: user.profilePicture,
                }
            },
            message: "User details retrieved successfully."
        });
    } catch (e) {
        if (process.env.NODE_ENV === 'development') console.log(e);
        return sendErrorResponse(
            res,
            500,
            "Internal server error."
        )
    }
}
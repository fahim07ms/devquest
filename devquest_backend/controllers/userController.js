import {sendErrorResponse} from "../utils/error.js";
import UserModel from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";

// Get user details
export const getUserDetails = async (req, res) => {
    try {
        const user = await UserModel.getUserById(req.userId);
        
        if (!user) {
            return sendErrorResponse(
                res,
                 404,
                "User not found."
            )
        }
        
        return res.status(200).json({
            data: {
                user: user,
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

// Get Public Profile (Using username)
export const getPublicProfile = async (req, res) => {
    const { username } = req.params;
    
    try {
        const user = await UserModel.getUserByUsername(username);
        
        if (!user) {
            return sendErrorResponse(
                res,
                  404,
                "User not found."
            )
        }
        
        const { passwordHash, ...publicProfile } = user;
        
        return res.status(200).json({
            data: {
                user: publicProfile,
            },
            message: "Public profile retrieved successfully."
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

export const  updateUserProfile = async (req, res) => {
    const userId = req.userId;
    const {
        firstName, lastName, birthDate, bio, website
    } = req.body;
    
    try {
        const updatedUser = await UserModel.updateUserProfileData(
            userId,
            {
                firstName, lastName, birthDate, bio, website
            }
        );
        
        return res.status(200).json({
            data: {
                user: updatedUser
            },
            message: "User profile updated successfully."
        })
    } catch (e) {
        if (process.env.NODE_ENV === 'development') console.log(e);
        
        if (e.message === 'NOT_FOUND') {
            return sendErrorResponse(
                res,
                  404,
                "User not found."
            )
        }
        
        return sendErrorResponse(
            res,
             500,
        )
    }
}

// Uploading profile picture
export const uploadProfileImage = async (req, res) => {
    const userId = req.userId;
    
    if (!req.file) {
        return sendErrorResponse(
            res,
              400,
            "No file uploaded."
        );
    }
    
    try {
        // Upload image to Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
            folder: "profiles",
            resource_type: "image",
            public_id: `user_${userId}_${Date.now()}`,
        });
        
        const profilePicture = uploadResult.secure_url;
        
        const updatedUser = await UserModel.updateUserProfilePicture(userId, profilePicture);
        
        return res.status(200).json({
            data: {
                user: updatedUser
            },
            message: "Profile picture uploaded successfully."
        })
        
        
    } catch (e) {
        if (process.env.NODE_ENV === 'development') console.log(e);
        
        if (e.message === 'NOT_FOUND') {
            return sendErrorResponse(
                res,
                   404,
                "User not found."
            )
        }
        
        return sendErrorResponse(
            res,
              500,
            "Internal server error."
        )
    }
}

// Get user-asked questions
export const getUserQuestions = async (req, res) => {
    const { username } = req.params;
    
    try {
        const questions = await UserModel.getQuestionsByUsername(username);
        
        return res.status(200).json({
            data: {
                questions: questions
            },
            message: "User questions retrieved successfully."
        })
    } catch (e) {
        if (process.env.NODE_ENV === 'development') console.log(e);
        return sendErrorResponse(
            res,
             500,
            "Internal server error."
        )
    }
};

// Get user-answered questions
export const getUserAnswers = async (req, res) => {
    const { username } = req.params;
    
    try {
        const answers = await UserModel.getAnswersByUsername(username);
        
        return res.status(200).json({
            data: {
                answers: answers
            },
            message: "User answers retrieved successfully."
        })
    } catch (e) {
        if (process.env.NODE_ENV === 'development') console.log(e);
        return sendErrorResponse(
            res,
            500,
            "Internal server error."
        )
    }
}

// Get user badges
export const getUserBadges = async (req, res) => {
    const { username } = req.params;
    
    try {
        const result = await UserModel.getUserBadges(username);
        
        return res.status(200).json({
            data: { badges: result },
            message: 'Badges fetched successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// get user reputation history
export const getMyReputationHistory = async (req, res) => {
    const userId = req.userId;
    const page   = parseInt(req.query.page,  10) || 1;
    const limit  = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;
    
    try {
        const result = await UserModel.getUserReputationHistory(userId, limit, offset);
        
        return res.status(200).json({
            data: result,
            message: 'Reputation history fetched successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};
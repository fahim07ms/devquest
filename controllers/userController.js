import {sendErrorResponse} from "../utils/error.js";
import UserModel from "../models/userModel.js";
import cloudinary from "../config/cloudinary";

export const getUserDetails = async (req, res) => {
    try {
        const user = await UserModel.getUserById(req.userId);
        
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

export const updateUserProfile = async (req, res) => {
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

// Get user asked questions
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

// Get user answered questions
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
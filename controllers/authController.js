import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {sendErrorResponse} from "../utils/error.js";
import dotenv from 'dotenv';
import authModel from "../models/authModel.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '30d';

const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

const accessCookieOption = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

const refreshCookieOption = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
}

export const register = async (req, res) => {
    // Get the body data
    const {
        username,
        email,
        password,
        confirmPassword
    } = req.body;
    
    if (!username || !email || !password || !confirmPassword) {
        return sendErrorResponse(
            res,
            400,
            "All fields are required."
        );
    }
    
    if (username.length < 1) {
        return sendErrorResponse(
            res,
            400,
            "Username must be at least 1 character long."
        );
    }
    
    if (password.length < 8) {
        return sendErrorResponse(
            res,
            400,
            "Password must be at least 8 characters long."
        );
    }
    
    // Check if the user confirmed the password properly
    if (password !== confirmPassword) {
        return sendErrorResponse(
            res,
            401,
            "Password don't match."
        );
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);
    
    try {
        // Check if the username already exists
        const existingUser = await authModel.getUserByUsername(username);
        
        if (existingUser) {
            return sendErrorResponse(
                res,
                409,
                "Username already exists."
            );
        }
        
        // Check if the email already exists
        const existingEmail = await authModel.getUserByEmail(email);
        if (existingEmail) {
            return sendErrorResponse(
                res,
                409,
                "Email already exists."
            );
        }
        
        // Create the user
        const user = await authModel.registerUser(username, email, passwordHash);
        
        return res.status(201).json({
            message: "User created successfully."
        });
    } catch (e) {
        if (process.env.NODE_ENV === 'development') console.log(e);
        return sendErrorResponse(
            res,
            500,
            "Internal server error."
        );
    }
}

export const login = async (req, res) => {
    const {username, password} = req.body;
    
    // Check if the username and password are provided
    if (!username || !password) {
        return sendErrorResponse(
            res,
            400,
            "All fields are required."
        );
    }
    
    try {
        // Check if the user exists
        const user = await authModel.getUserByUsername(username);
        if (!user) {
            return sendErrorResponse(
                res,
                404,
                "User not found."
            );
        }
        
        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return sendErrorResponse(
                res,
                401,
                "Invalid credentials."
            );
        }
        
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        
        res.cookie('accessToken', accessToken, accessCookieOption);
        res.cookie('refreshToken', refreshToken, refreshCookieOption);
        
        return res.status(200).json({
            data: {
                user: {
                    id: user.id,
                    role: user.role,
                }
            },
            message: "Login successful."
        })
        
    } catch (e) {
        if (process.env.NODE_ENV === 'development') console.log(e);
        return sendErrorResponse(
            res,
            500,
            "Internal server error."
        );
    }
}

export const logout = async (req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });
    
    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    })
    
    return res.status(200).json({
        message: "Logout successful."
    })
}

export const refreshAccessToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        
        if (!token) {
            return sendErrorResponse(
                res,
                401,
                "Unauthorized."
            );
        }
        
        const payload = await jwt.verify(token, REFRESH_SECRET);
        
        if (payload.type && payload.type !== 'refresh') {
            return sendErrorResponse(
                res,
                401,
                'Invalid token.'
            )
        }
        
        const user = await authModel.getUserById(payload.userId);
        if (!user) {
            return sendErrorResponse(
                res,
                404,
                "User not found."
            );
        }
        
        const accessToken = generateAccessToken(user.id);
        res.cookie('accessToken', accessToken, accessCookieOption);
        
        return res.status(200).json({
            data: {
                user: {
                    id: user.id,
                    username: user.username
                }
            },
            message: "Access token refreshed successfully."
        })
        
    } catch (e) {
        if (prcoess.env.NODE_ENV === 'development') console.log(e);
        return sendErrorResponse(
            res,
            500,
            "Internal server error."
        )
    }
}


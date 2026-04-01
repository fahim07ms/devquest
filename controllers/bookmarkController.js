import BookmarkModel from '../models/bookmarkModel.js';
import { sendErrorResponse } from '../utils/error.js';

// Add a bookmark
export const addBookmark = async (req, res) => {
    const { contentId } = req.params;
    const userId = req.userId;

    try {
        await BookmarkModel.addBookmark(userId, contentId);
        
        return res.status(201).json({
            message: 'Bookmarked successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        // Handle potential foreign key violation if content doesn't exist
        if (error.code === '23503') {
            return sendErrorResponse(res, 404, 'Content not found.');
        }

        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Remove a bookmark
export const removeBookmark = async (req, res) => {
    const { contentId } = req.params;
    const userId = req.userId;

    try {
        await BookmarkModel.removeBookmark(userId, contentId);
        
        return res.status(200).json({
            message: 'Bookmark removed successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Check bookmark status
export const checkBookmarkStatus = async (req, res) => {
    const { contentId } = req.params;
    const userId = req.userId;

    try {
        const isBookmarked = await BookmarkModel.checkBookmark(userId, contentId);
        
        return res.status(200).json({
            data: { isBookmarked },
            message: 'Bookmark status retrieved.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Get all user bookmarks
export const getUserBookmarks = async (req, res) => {
    const userId = req.userId;
    let { page, limit } = req.query;

    if (isNaN(page) || page <= 0) page = 1;
    if (isNaN(limit) || limit <= 0) limit = 10;
    
    const limitValue = parseInt(limit, 10) || 10;
    const offset = (page - 1) * limitValue;
    const bypassFreeze = req.role === 'admin' || req.role === 'moderator';

    try {
        const result = await BookmarkModel.getUserBookmarks(userId, limitValue, offset, bypassFreeze);
        
        return res.status(200).json({
            data: result,
            message: 'Bookmarks retrieved successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

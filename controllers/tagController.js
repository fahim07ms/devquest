import Tag from '../models/tagModel.js';
import {sendErrorResponse} from "../utils/error.js";

// Get all tags
const getTags = async (req, res) => {
    try {
        const tags = await Tag.getAllTags();
        return res.status(200).json({
            data: {
                tags: tags
            },
            message: "Tags retrieved successfully."
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        return res.status(500).json({
            message: "Internal server error."
        });
    }
}

// Get details of all tags
const getDetailedTags = async (req, res) => {
    let { page, limit, search } = req.query;
    
    if (isNaN(page) || page <= 0) {
        page = 1;
    }
    
    if (isNaN(limit) || limit <= 0) {
        limit = 10;
    }
    
    const limitValue = parseInt(limit, 10) || 10;
    const offset = (page - 1) * limitValue;
    const searchValue = search || '';
    const { tags, currentPage, totalPages, totalTags } = await Tag.getDetailedTags({
        offset,
        limit: limitValue,
        search: searchValue,
    });
    return res.status(200).json({
        data: {
            tags,
            currentPage,
            totalPages,
            totalTags,
        },
        message: "Tags retrieved successfully."
    });
}

// Tags followed by the authenticated user
const getFollowedTags = async (req, res) => {
    const userId = req.userId;
    try {
        const tags = await Tag.getFollowedTags(userId);
        return res.status(200).json({
            data: { tags },
            message: 'Followed tags retrieved successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Follow a tag
const followTag = async (req, res) => {
    const { tagId } = req.params;
    const userId    = req.userId;
    
    try {
        await Tag.followTag(userId, tagId);
        return res.status(200).json({ message: 'Tag followed.' });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        
        if (error.message === 'TAG_NOT_FOUND') return sendErrorResponse(res, 404, 'Tag not found.');
        
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Unfollow a tag
const unfollowTag = async (req, res) => {
    const { tagId } = req.params;
    const userId    = req.userId;
    
    try {
        await Tag.unfollowTag(userId, tagId);
        return res.status(200).json({
            message: 'Tag unfollowed.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

export default {
    getTags,
    getDetailedTags,
    getFollowedTags,
    followTag,
    unfollowTag,
};
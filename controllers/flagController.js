import FlagModel from '../models/flagModel.js';
import { sendErrorResponse } from '../utils/error.js';

// Any authenticated user can flag a piece of content
export const createFlag = async (req, res) => {
    const userId = req.userId;
    const { contentId, reason, flagCategory, suggestedDuplicateId } = req.body;
    
    try {
        const flag = await FlagModel.createFlag(userId, {
            contentId,
            reason,
            flagCategory,
            suggestedDuplicateId,
        });
        
        if (!flag) {
            return sendErrorResponse(
                res,
                424,
                'Failed to create flag.'
            );
        }
        
        return res.status(201).json({
            data: {
                flag: flag,
            },
            message: 'Content flagged successfully.',
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        if (error.message === 'ALREADY_FLAGGED') {
            return sendErrorResponse(
                res,
                409,
                'You have already flagged this content.'
            );
        }
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error'
        );
    }
};

// Moderator/admin only — list all flags with optional status & category filters
export const getAllFlags = async (req, res) => {
    let { page, limit, status, category } = req.query;
    
    if (isNaN(page) || page <= 0) page = 1;
    if (isNaN(limit) || limit <= 0) limit = 20;
    
    const limitValue = parseInt(limit, 10);
    const offset     = (parseInt(page, 10) - 1) * limitValue;
    
    try {
        const { flags, totalFlags } = await FlagModel.getAllFlags({
            status:   status   || null,
            category: category || null,
            limit:    limitValue,
            offset,
        });
        
        const totalPages  = Math.ceil(totalFlags / limitValue);
        const currentPage = parseInt(page, 10);
        
        return res.status(200).json({
            data: {
                flags,
                totalFlags,
                totalPages,
                currentPage,
            },
            message: 'Flags retrieved successfully.',
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error'
        );
    }
};

// Moderator/admin only — get a single flag
export const getFlagById = async (req, res) => {
    const { flagId } = req.params;
    
    try {
        const flag = await FlagModel.getFlagById(flagId);
        
        if (!flag) {
            return sendErrorResponse(
                res,
                404,
                'Flag not found.'
            );
        }
        
        return res.status(200).json({
            data: {
                flag: flag,
            },
            message: 'Flag retrieved successfully.',
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error'
        );
    }
};

// Moderator/admin only — all flags on a specific piece of content
export const getFlagsByContentId = async (req, res) => {
    const { contentId } = req.params;
    
    try {
        const flags = await FlagModel.getFlagsByContentId(contentId);
        
        return res.status(200).json({
            data: {
                flags: flags,
            },
            message: 'Content flags retrieved successfully.',
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error'
        );
    }
};

// Moderator/admin only — update flag status and optionally add a note.
// Changing from 'action_taken' to another status will automatically unfreeze
// the associated content (handled inside flagModel.reviewFlag).
export const reviewFlag = async (req, res) => {
    const { flagId }   = req.params;
    const moderatorId  = req.userId;
    const { status, moderatorNote } = req.body;
    
    try {
        const flag = await FlagModel.getFlagById(flagId);
        
        if (!flag) {
            return sendErrorResponse(
                res,
                404,
                'Flag not found.'
            );
        }
        
        const updatedFlag = await FlagModel.reviewFlag(flagId, moderatorId, {
            status,
            moderatorNote,
        });
        
        if (!updatedFlag) {
            return sendErrorResponse(
                res,
                424,
                'Failed to update flag.'
            );
        }
        
        return res.status(200).json({
            data: {
                flag: updatedFlag,
            },
            message: 'Flag reviewed successfully.',
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        if (error.message === 'NOT_FOUND') {
            return sendErrorResponse(
                res,
                404,
                'Flag not found.'
            );
        }
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error'
        );
    }
};

// Moderator/admin only — remove a flag entirely
export const deleteFlag = async (req, res) => {
    const { flagId } = req.params;
    
    try {
        const flag = await FlagModel.getFlagById(flagId);
        
        if (!flag) {
            return sendErrorResponse(
                res,
                404,
                'Flag not found.'
            );
        }
        
        const deleted = await FlagModel.deleteFlag(flagId);
        
        if (!deleted) {
            return sendErrorResponse(
                res,
                424,
                'Failed to delete flag.'
            );
        }
        
        return res.status(200).json({
            message: 'Flag deleted successfully.',
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        if (error.message === 'NOT_FOUND') {
            return sendErrorResponse(
                res,
                404,
                'Flag not found.'
            );
        }
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error'
        );
    }
};

// Moderator/admin only — explicitly unfreeze a piece of content
export const unfreezeContent = async (req, res) => {
    const { contentId } = req.params;
    
    try {
        const result = await FlagModel.unfreezeContent(contentId);
        
        if (!result) {
            return sendErrorResponse(
                res,
                404,
                'Content not found.'
            );
        }
        
        return res.status(200).json({
            message: 'Content unfrozen successfully.',
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error'
        );
    }
};
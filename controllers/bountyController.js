import BountyModel from '../models/bountyModel.js';
import pool from '../db/pool.js';
import { sendErrorResponse } from '../utils/error.js';

// Create a bounty on a question
export const createBounty = async (req, res) => {
    const { questionId } = req.params;
    const { amount, reason } = req.body;
    const userId = req.userId;
    
    // Check if the question exists
    if (!questionId) {
        return sendErrorResponse(res, 400, 'Question ID is required.');
    }
    
    try {
        const bounty = await BountyModel.createBounty(questionId, userId, parseInt(amount), reason.trim());
        
        return res.status(201).json({
            data: { bounty },
            message: 'Bounty created successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        
        if (error.message === 'INSUFFICIENT_REPUTATION') {
            return sendErrorResponse(res, 400, 'Not enough reputation to offer this bounty.');
        }
        
        // Foreign key violation — question doesn't exist
        if (error.code === '23503') {
            return sendErrorResponse(res, 404, 'Question not found.');
        }
        
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Award a bounty to a specific answer
export const awardBounty = async (req, res) => {
    const { bountyId } = req.params;
    const { answerId } = req.body;
    const userId = req.userId;
    
    if (!answerId) {
        return sendErrorResponse(res, 400, 'Answer ID is required.');
    }
    
    try {
        // Verify the requester is either the bounty offerer or a moderator/admin
        const bountyCheck = await pool.query(
            `SELECT offered_by FROM bounty WHERE bounty_id = $1`,
            [bountyId]
        );
        
        if (bountyCheck.rowCount === 0) {
            return sendErrorResponse(res, 404, 'Bounty not found.');
        }
        
        const isOfferer = bountyCheck.rows[0].offered_by === userId;
        const isModerator = ['moderator', 'admin'].includes(req.role);
        
        if (!isOfferer && !isModerator) {
            return sendErrorResponse(res, 403, 'Only the bounty offerer can award it.');
        }
        
        const bounty = await BountyModel.awardBounty(bountyId, answerId, userId);
        
        return res.status(200).json({
            data: { bounty },
            message: 'Bounty awarded successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        
        if (error.message === 'BOUNTY_NOT_ACTIVE') {
            return sendErrorResponse(res, 400, 'Bounty is no longer active.');
        }
        if (error.message === 'NOT_FOUND') {
            return sendErrorResponse(res, 404, 'Bounty not found.');
        }
        if (error.message === 'ANSWER_NOT_FOUND') {
            return sendErrorResponse(res, 404, 'Answer not found or does not belong to this question.');
        }
        
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};
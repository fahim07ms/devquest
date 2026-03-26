import ContentModel from '../models/contentModel.js';
import VoteModel from '../models/voteModel.js';
import {sendErrorResponse} from "../utils/error.js";

export const castVote = async (req, res) => {
    const { contentId, voteType } = req.body;
    
    try {
        // Check if the content exists
        const content = await ContentModel.getContentById(contentId);
        
        if (!content) {
            return sendErrorResponse(
                res,
                 404,
                'Content not found.'
            );
        }
        
        // Vote on the content
        const vote = await VoteModel.vote(contentId, req.userId, voteType);
        
        if (!vote) {
            return sendErrorResponse(
                res,
                  424,
                'Failed to cast vote.'
            );
        }
        
        return res.status(200).json({
            data: {
                vote: vote
            },
            message: 'Vote cast successfully.'
        })
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        // Check if the user has already voted for this content
        if (error.code === '23505') {
            return sendErrorResponse(
                res,
                  409,
                'You have already voted for this content.'
            )
        }
        
        return sendErrorResponse(
            res,
             500,
            'Internal Server Error'
        );
    }
};

// Get votes for a content
export const getVotesByContentId = async (req, res) => {
    const { contentId } = req.params;
    
    try {
        const votes = await VoteModel.getVoteForContent(contentId);
        
        return res.status(200).json({
            data: {
                votes: votes
            },
            message: 'Votes retrieved successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        return sendErrorResponse(
            res,
              500,
            'Internal Server Error'
        );
    }
}

// Update vote status
export const updateVote = async (req, res) => {
    const { voteId } = req.params;
    const { voteType } = req.body;
    
    try {
        const updatedVote = await VoteModel.updateVote(voteId, voteType);
        
        if (!updatedVote) {
            return sendErrorResponse(
                res,
                   424,
                'Failed to update vote.'
            );
        }
        
        return res.status(200).json({
            data: {
                vote: updatedVote,
            },
            message: 'Vote updated successfully.'
        })
        
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        if (error.message === 'NOT_FOUND') {
            return sendErrorResponse(
                res,
                   404,
                'Vote not found.'
            );
        }
        
        return sendErrorResponse(
            res,
              500,
            'Internal Server Error'
        );
    }
};

// Delete a vote
export const deleteVote = async (req, res) => {
    const { voteId } = req.params;
    const userId = req.userId;
    
    try {
        const deletedVote = await VoteModel.deleteVote(voteId, userId);
        
        if (!deletedVote) {
            return sendErrorResponse(
                res,
                    424,
                'Failed to delete vote.'
            );
        }
        
        return res.status(200).json({
            message: 'Vote deleted successfully.'
        })
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        if (error.message === 'NOT_FOUND') {
            return sendErrorResponse(
                res,
                    404,
                'Vote not found.'
            );
        }
        
        return sendErrorResponse(
            res,
               500,
            'Internal Server Error'
        );
    }
}

// Get user's vote for a specific content
export const getUserVoteOnContent = async (req, res) => {
    const { contentId } = req.params;
    const userId = req.userId;
    
    try {
        const vote = await VoteModel.getUserVoteForContent(contentId, userId);
        
        if (!vote) {
            return sendErrorResponse(
                res,
                     404,
                'Vote not found.'
            );
        }
        
        return res.status(200).json({
            data: {
                vote: vote,
            },
            message: 'Vote retrieved successfully.'
        })
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        return sendErrorResponse(
            res,
              500,
            'Internal Server Error'
        );
    }
}
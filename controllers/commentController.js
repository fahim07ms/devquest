import CommentModel from '../models/commentModel.js';
import { sendErrorResponse } from "../utils/error.js";
import AnswerModel from "../models/answerModel.js";
import QuestionModel from "../models/questionModel.js";

// Get comments for a question or any content using parent ID
export const getCommentsByParentId = async (req, res) => {
    const { questionId } = req.params;
    const { answerId } = req.params;
    const { commentId } = req.params;
    
    const parentId = answerId || questionId || commentId;
    const bypassFreeze = req.role === 'admin' || req.role === 'moderator';
    
    try {
        const comments = await CommentModel.getCommentsByParentId(parentId, bypassFreeze);
        
        return res.status(200).json({
            data: {
                comments: comments,
            },
            message: 'Comments retrieved successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error',
        );
    }
};

// Get a single comment by ID
export const getCommentById = async (req, res) => {
    const { commentId } = req.params;
    const bypassFreeze = req.role === 'admin' || req.role === 'moderator';
    
    try {
        const comment = await CommentModel.getCommentById(commentId, bypassFreeze);
        
        if (!comment) {
            return sendErrorResponse(
                res,
                404,
                'Comment not found.'
            )
        }
        
        return res.status(200).json({
            data: {
                comment: comment,
            },
            message: 'Comment retrieved successfully.'
        })
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        return sendErrorResponse(
            res,
             500,
            'Internal Server Error',
        )
    }
}

// Create a comment on a question
export const createComment = async (req, res) => {
    const { questionId } = req.params;
    const { answerId } = req.params;
    const { commentId } = req.params;
    
    // Validate that either answerId, questionId or commentId is provided
    let parentId = null;
    let parentType = null;
    if (answerId) {
        parentId = answerId;
        parentType = 'answer';
    }
    if (questionId) {
        parentId = questionId;
        parentType = 'question';
    }
    if (commentId) {
        parentId = commentId;
        parentType = 'comment';
    }
    
    const { body, recipientId } = req.body;
    
    try {
        // Validate that the parent exists
        let parent = null;
        if (parentType === 'answer') { parent = await AnswerModel.getAnswerById(parentId); }
        if (parentType === 'question') { parent = await QuestionModel.getQuestionById(parentId); }
        if (parentType === 'comment') { parent = await CommentModel.getCommentById(parentId); }
        
        if (!parent) {
            return sendErrorResponse(
                res,
                 404,
                `${parentType?.toUpperCase()} not found.`
            )
        }
        
        const comment = await CommentModel.createComment(req.userId, parentId, recipientId, body);
        
        if (!comment) {
            return sendErrorResponse(
                res,
                424,
                'Failed to create comment.'
            )
        }
        
        return res.status(201).json({
            data: {
                comment: comment
            },
            message: 'Comment created successfully.'
        })
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        return sendErrorResponse(
            res,
             500,
            'Internal Server Error',
        )
    }
};

// Edit a comment
export const editComment = async (req, res) => {
    const { commentId } = req.params;
    const { body } = req.body;
    const userId = req.userId;
    
    try {
        const comment = await CommentModel.getCommentById(commentId);
        
        if (!comment) {
            return sendErrorResponse(
                res,
                 404,
                'Comment not found.'
            )
        }
        
        // Check if the user is the author of the comment
        if (comment.author.authorId !== userId) {
            return sendErrorResponse(
                res,
                 403,
                'You are not authorized to edit this comment.'
            )
        }
        
        const updatedComment = await CommentModel.updateComment(commentId, body, userId);
        
        if (!updatedComment) {
            return sendErrorResponse(
                res,
                  424,
                'Failed to update comment.'
            )
        }
        
        return res.status(200).json({
            data: {
                comment: updatedComment
            }
        })
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        if (error.message === 'UNAUTHORIZED_OR_NOT_FOUND') {
            return sendErrorResponse(
                res,
                  403,
                'You are not authorized to edit this comment.'
            )
        }
        
        return sendErrorResponse(
            res,
              500,
            'Internal Server Error',
        )
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.userId;
    
    try {
        const comment = await CommentModel.getCommentById(commentId);
        
        if (!comment) {
            return sendErrorResponse(
                res,
                  404,
                'Comment not found.'
            )
        }
        
        if (comment.author.authorId !== userId) {
            return sendErrorResponse(
                res,
                   403,
                'You are not authorized to delete this comment.'
            )
        }
        
        const deleted = await CommentModel.deleteComment(commentId, userId);
        
        if (!deleted) {
            return sendErrorResponse(
                res,
                   424,
                'Failed to delete comment.'
            )
        }
        
        return res.status(200).json({
            message: 'Comment deleted successfully.'
        })
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        if (error.message === 'NOT_FOUND') {
            return sendErrorResponse(
                res,
                   404,
                'Comment not found.'
            )
        }
        
        if (error.message === 'UNAUTHORIZED') {
            return sendErrorResponse(
                res,
                    403,
                'You are not authorized to delete this comment.'
            )
        }
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error',
        )
    }
};
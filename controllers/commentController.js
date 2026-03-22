import CommentModel from '../models/commentModel.js';
import { sendErrorResponse } from "../utils/error.js";

// Get comments for a question or any content using parent ID
export const getCommentsByParentId = async (req, res) => {
    const { questionId } = req.params;
    const { answerId } = req.params;
    
    const parentId = answerId || questionId;
    
    try {
        const comments = await CommentModel.getCommentsByParentId(parentId);
        
        return res.status(200).json({
            data: {
                comments: comments.map(c => ({
                    id: c['content_id'],
                    parentId: c['parent_id'],
                    depthLevel: c['depth_level'],
                    body: c['body'],
                    voteScore: c['vote_score'],
                    createdAt: c['created_at'],
                    updatedAt: c['updated_at'],
                    author: {
                        username: c['username'],
                        firstName: c['first_name'],
                        lastName: c['last_name'],
                        profilePicture: c['profile_picture'],
                    },
                }))
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


// Create a comment on a question
export const createComment = async (req, res) => {
    const { questionId } = req.params;
    const { answerId } = req.params;
    
    const parentId = answerId || questionId;
    
    const { body } = req.body;
    
    try {
        const comment = await CommentModel.createComment(req.userId, parentId, body);
        
        if (!comment) {
            return sendErrorResponse(
                res,
                424,
                'Failed to create comment.'
            )
        }
        
        return res.status(201).json({
            data: {
                comment: {
                    id: comment['content_id'],
                    parentId: comment['parent_id'],
                    depthLevel: comment['depth_level'],
                    body: comment['body'],
                    voteScore: comment['vote_score'],
                    createdAt: comment['created_at'],
                    updatedAt: comment['updated_at'],
                    author: {
                        username: comment['username'],
                        firstName: comment['first_name'],
                        lastName: comment['last_name'],
                        profilePicture: comment['profile_picture'],
                    },
                }
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

// Create a comment on an answer
export const createAnswerComment = async (req, res) => {
    // TODO: Implement this endpoint
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
        
        if (comment['author_id'] !== userId) {
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
                comment: {
                    id: updatedComment['content_id'],
                    parentId: updatedComment['parent_id'],
                    depthLevel: updatedComment['depth_level'],
                    body: updatedComment['body'],
                    voteScore: updatedComment['vote_score'],
                    createdAt: updatedComment['created_at'],
                    updatedAt: updatedComment['updated_at'],
                    author: {
                        firstName: comment['first_name'],
                        lastName: comment['last_name'],
                        profilePicture: comment['profile_picture'],
                    }
                }
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
        
        if (comment['author_id'] !== userId) {
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
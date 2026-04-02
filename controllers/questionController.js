import QuestionModel from '../models/questionModel.js';
import { sendErrorResponse } from '../utils/error.js';

const sortOptions = {
    'createdAt':      'c.created_at',
    'answersCount':   'q.answer_count',
    'lastActivityAt': 'q.last_activity_at',
    'voteScore':      'c.vote_score',
};

// Get all questions with pagination, sorting, filtering and search
export const getQuestions = async (req, res) => {
    let { page, limit, sort, order, search, answered, hasBounty } = req.query;
    
    if (isNaN(page) || page <= 0) page = 1;
    if (isNaN(limit) || limit <= 0) limit = 10;
    
    const limitValue  = parseInt(limit, 10) || 10;
    const offset      = (page - 1) * limitValue;
    const sortValue   = sortOptions[sort] || sortOptions['createdAt'];
    const orderValue  = order === 'asc' ? 'ASC' : 'DESC';
    const searchValue = search || '';
    const tags        = req.query.tags ? req.query.tags.split(',').filter(Boolean) : [];
    
    // Moderators and admins see frozen content in listings
    const bypassFreeze = req.role === 'admin' || req.role === 'moderator';
    
    try {
        const { questions, totalQuestions, currentPage, totalPages } =
            await QuestionModel.getQuestions(
                limitValue,
                offset,
                sortValue,
                orderValue,
                tags,
                searchValue,
                answered,   // passed as raw string 'true'/'false'/undefined — model handles the cast
                hasBounty,  // passed as raw string 'true'/'false'/undefined
                bypassFreeze
            );
        
        return res.status(200).json({
            data: { questions, totalQuestions, totalPages, currentPage },
            message: 'Questions retrieved successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Get a single question by ID
export const getQuestionById = async (req, res) => {
    const { questionId }  = req.params;
    const bypassFreeze    = req.role === 'admin' || req.role === 'moderator';
    
    try {
        const question = await QuestionModel.getQuestionById(questionId, bypassFreeze);
        
        if (!question) {
            return sendErrorResponse(res, 404, 'Question not found.');
        }
        
        return res.status(200).json({
            data: { question },
            message: 'Question retrieved successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Create a new question
export const createQuestion = async (req, res) => {
    const { title, body, tags } = req.body;
    
    try {
        const question = await QuestionModel.createQuestion(req.userId, title, body, tags);
        
        if (!question) {
            return sendErrorResponse(res, 424, 'Failed to create question.');
        }
        
        return res.status(201).json({
            data: { question },
            message: 'Question created successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Edit an existing question
export const editQuestion = async (req, res) => {
    const { questionId } = req.params;
    const { title, body, tags } = req.body;
    const userId = req.userId;
    
    try {
        const question = await QuestionModel.getQuestionById(questionId);
        if (!question) {
            return sendErrorResponse(res, 404, 'Question not found.');
        }
        
        if (question.author.authorId !== userId) {
            return sendErrorResponse(res, 403, 'You are not authorized to edit this question.');
        }
        
        const updatedQuestion = await QuestionModel.updateQuestion(questionId, title, body, tags, userId);
        if (!updatedQuestion) {
            return sendErrorResponse(res, 424, 'Failed to update question.');
        }
        
        return res.status(200).json({
            data: { question: updatedQuestion }
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        
        if (error.message === 'UNAUTHORIZED_OR_NOT_FOUND') {
            return sendErrorResponse(res, 403, 'You are not authorized to edit this question.');
        }
        
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Delete a question
export const deleteQuestion = async (req, res) => {
    const { questionId } = req.params;
    const userId         = req.userId;
    
    try {
        const deleted = await QuestionModel.deleteQuestion(questionId, userId);
        
        if (!deleted) {
            return sendErrorResponse(res, 424, 'Failed to delete question.');
        }
        
        return res.status(200).json({ message: 'Question deleted successfully.' });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        
        if (error.message === 'NOT_FOUND')   return sendErrorResponse(res, 404, 'Question not found.');
        if (error.message === 'UNAUTHORIZED') return sendErrorResponse(res, 403, 'You are not authorized to delete this question.');
        
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Increment question view count (fire-and-forget)
export const updateQuestionViewCount = async (req, res) => {
    const { questionId } = req.params;
    
    try {
        await QuestionModel.updateViewCount(questionId);
        return res.status(200).json({ message: 'View count updated.' });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};
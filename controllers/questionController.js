import QuestionModel from '../models/questionModel.js';
import {sendErrorResponse} from "../utils/error.js";

const sortOptions = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'viewCount': 'view_count',
    'answersCount': 'answers_count',
    'lastActivityAt': 'last_activity_at',
    'voteScore': 'vote_score',
}

// Get all questions with pagination, sorting, filtering and search
export const getQuestions = async (req, res) => {
    let { page, limit, sort, order, search } = req.query;
    
    if (isNaN(page) || page <= 0) {
        page = 1;
    }
    
    if (isNaN(limit) || limit <= 0) {
        limit = 10;
    }
    
    const offset = (page - 1) * limit;
    const limitValue = parseInt(limit, 10) || 10;
    const sortValue = sortOptions[sort] || sortOptions['createdAt'];
    const orderValue = order === 'asc' ? 'ASC' : 'DESC';
    const searchValue = search || '';
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    console.log(sortValue, orderValue, tags, searchValue, limitValue, offset)
    try {
        const questions = await QuestionModel.getQuestions(
            limitValue,
            offset,
            sortValue,
            orderValue,
            tags,
            searchValue
        );
        
        return res.status(200).json({
            data: {
                questions: questions
            },
            message: 'Questions retrieved successfully.'
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error',
        )
    }
    
};

// Get a single question by ID
export const getQuestionById = async (req, res) => {
    const { questionId } = req.params;
    
    try {
        const question = await QuestionModel.getQuestionById(questionId);
        
        if (!question) {
            return sendErrorResponse(
                res,
                404,
                'Question not found.'
            )
        }
        
        return res.status(200).json({
            data: {
                question: {
                    id: question['content_id'],
                    title: question['title'],
                    body: question['body'],
                    voteScore: question['vote_score'],
                    createdAt: question['created_at'],
                    updatedAt: question['updated_at'],
                    viewCount: question['view_count'],
                    answersCount: question['answers_count'],
                    lastActivityAt: question['last_activity_at'],
                    author: {
                        firstName: question['first_name'],
                        lastName: question['last_name'],
                        profilePicture: question['profile_picture'],
                    }
                }
            },
            message: 'Question retrieved successfully.'
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

// Create Question
export const createQuestion = async (req, res) => {
    const { title, body, tags } = req.body;
    
    try {
        const question = await QuestionModel.createQuestion(req.userId, title, body, tags);
        
        if (!question) {
            return sendErrorResponse(
                res,
                424,
                'Failed to create question.'
            )
        }
        
        return res.status(201).json({
            data: {
                question: question
            },
            message: 'Question created successfully.'
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

// Edit Question
export const editQuestion = async (req, res) => {
    const { questionId } = req.params;
    const { title, body, tags } = req.body;
    const userId = req.userId;
    
    try {
        // Check if the question exists
        const question = await QuestionModel.getQuestionById(questionId);
        
        if (!question) {
            return sendErrorResponse(
                res,
                404,
                'Question not found.'
            )
        }
        
        // Check if the user is the author of the question
        if (question['author_id'] !== userId) {
            return sendErrorResponse(
                res,
                403,
                'You are not authorized to edit this question.'
            )
        }
        
        const updatedQuestion = await QuestionModel.updateQuestion(
            questionId,
            title,
            body,
            tags,
            userId
        );
        
        if (!updatedQuestion) {
            return sendErrorResponse(
                res,
                424,
                'Failed to update question.'
            )
        }
        // TODO: Tags update
        
        return res.status(200).json({
            data: {
                question: {
                    id: updatedQuestion['content_id'],
                    title: updatedQuestion['title'],
                    body: updatedQuestion['body'],
                    voteScore: updatedQuestion['vote_score'],
                    createdAt: updatedQuestion['created_at'],
                    updatedAt: updatedQuestion['updated_at'],
                    viewCount: updatedQuestion['view_count'],
                    answersCount: updatedQuestion['answers_count'],
                    lastActivityAt: updatedQuestion['last_activity_at'],
                    author: {
                        firstName: question['first_name'],
                        lastName: question['last_name'],
                        profilePicture: question['profile_picture'],
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
                'You are not authorized to edit this question.'
            )
        }
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error',
        )
    }
};

// Delete Question
export const deleteQuestion = async (req, res) => {
    const { questionId } = req.params;
    const userId = req.userId;
    
    try {
        const deleted = await QuestionModel.deleteQuestion(questionId, userId);
        
        if (!deleted) {
            return sendErrorResponse(
                res,
                424,
                'Failed to delete question.'
            );
        }
        
        return res.status(200).json({
            message: 'Question deleted successfully.'
        })
        
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        if (error.message === 'NOT_FOUND') {
            return sendErrorResponse(
                res,
                404,
                'Question not found.'
            )
        }
        
        if (error.message === 'UNAUTHORIZED') {
            return sendErrorResponse(
                res,
                403,
                'You are not authorized to delete this question.'
            )
        }
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error',
        )
    }
};

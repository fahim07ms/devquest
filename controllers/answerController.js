import AnswerModel from '../models/answerModel.js';
import QuestionModel from '../models/questionModel.js';
import { sendErrorResponse } from '../utils/error.js';

// Get all answers for a question
export const getAnswersByQuestionId = async (req, res) => {
    const { questionId } = req.params;
    
    try {
        const question = await QuestionModel.getQuestionById(questionId);
        
        if (!question) {
            return sendErrorResponse(
                res,
                404,
                'Question not found.'
            );
        }
        
        const answers = await AnswerModel.getAnswersByQuestionId(questionId);
        
        return res.status(200).json({
            data: {
                answers: answers,
            },
            message: 'Answers retrieved successfully.',
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

// Get a single answer by ID
export const getAnswerById = async (req, res) => {
    const { answerId } = req.params;
    
    try {
        const answer = await AnswerModel.getAnswerById(answerId);
        
        if (!answer) {
            return sendErrorResponse(
                res,
                404,
                'Answer not found.'
            )
        }
        
        return res.status(200).json({
            data: {
                answer: answer,
            }
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

// Create an answer for a question
export const createAnswer = async (req, res) => {
    const { questionId } = req.params;
    const { body } = req.body;
    
    try {
        const question = await QuestionModel.getQuestionById(questionId);
        
        if (!question) {
            return sendErrorResponse(
                res,
                404,
                'Question not found.'
            );
        }
        
        const answer = await AnswerModel.createAnswer(req.userId, questionId, body);
        
        if (!answer) {
            return sendErrorResponse(
                res,
                424,
                'Failed to create answer.'
            );
        }
        
        return res.status(201).json({
            data: { answer },
            message: 'Answer created successfully.',
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

// Edit an answer
export const editAnswer = async (req, res) => {
    const { answerId } = req.params;
    const { body } = req.body;
    const userId = req.userId;
    
    try {
        const answer = await AnswerModel.getAnswerById(answerId);
        
        if (!answer) {
            return sendErrorResponse(res, 404, 'Answer not found.');
        }
        
        if (answer.author.authorId !== userId) {
            return sendErrorResponse(res, 403, 'You are not authorized to edit this answer.');
        }
        
        const updatedAnswer = await AnswerModel.updateAnswer(answerId, body, userId);
        
        if (!updatedAnswer) {
            return sendErrorResponse(res, 424, 'Failed to update answer.');
        }
        
        return res.status(200).json({
            data: {
                answer: updatedAnswer,
            },
            message: 'Answer updated successfully.',
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        if (error.message === 'UNAUTHORIZED_OR_NOT_FOUND') {
            return sendErrorResponse(res, 403, 'You are not authorized to edit this answer or answer not found.');
        }
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error'
        );
    }
};

// Delete an answer
export const deleteAnswer = async (req, res) => {
    const { answerId } = req.params;
    const userId = req.userId;
    
    try {
        const answer = await AnswerModel.getAnswerById(answerId);
        
        if (!answer) {
            return sendErrorResponse(
                res,
                404,
                'Answer not found.'
            );
        }
        
        if (answer.author.authorId !== userId) {
            return sendErrorResponse(
                res,
                403,
                'You are not authorized to delete this answer.'
            );
        }
        
        const deleted = await AnswerModel.deleteAnswer(answerId, userId);
        
        if (!deleted) {
            return sendErrorResponse(
                res,
                424,
                'Failed to delete answer.'
            );
        }
        
        return res.status(200).json({
            message: 'Answer deleted successfully.',
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        if (error.message === 'NOT_FOUND') {
            return sendErrorResponse(
                res,
                404,
                'Answer not found.'
            );
        }
        
        if (error.message === 'UNAUTHORIZED') {
            return sendErrorResponse(
                res,
                403,
                'You are not authorized to delete this answer.'
            );
        }
        
        return sendErrorResponse(
            res,
            500,
            'Internal Server Error'
        );
    }
};

// Update answer acceptance status
export const editAnswerAcceptanceStatus = async (req, res) => {
    const { answerId } = req.params;
    const userId = req.userId;
    const { accepted } = req.body;
    
    if (accepted !== true && accepted !== false) {
        return sendErrorResponse(res, 400, 'Invalid accepted value. Must be true or false.');
    }
    
    try {
        const answer = await AnswerModel.getAnswerById(answerId);
        if (!answer) return sendErrorResponse(res, 404, 'Answer not found.');
        
        // Fetch the parent question to verify the request user is its author
        const question = await QuestionModel.getQuestionById(answer.questionId);
        if (!question) return sendErrorResponse(res, 404, 'Parent question not found.');
        
        if (question.author.authorId !== userId) {
            return sendErrorResponse(res, 403, 'Only the question author can accept or unaccept answers.');
        }
        
        const acceptedAt = accepted ? new Date() : null;
        const updatedAnswer = await AnswerModel.updateAnswerStatus(answerId, accepted, acceptedAt);
        if (!updatedAnswer) return sendErrorResponse(res, 424, 'Failed to update answer acceptance status.');
        
        return res.status(200).json({
            data: { answer: updatedAnswer },
            message: 'Answer acceptance status updated successfully.',
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        if (error.message === 'NOT_FOUND') return sendErrorResponse(res, 404, 'Answer not found.');
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};
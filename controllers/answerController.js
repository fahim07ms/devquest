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
                answers: answers.map((a) => ({
                    id: a['content_id'],
                    isAccepted: a['is_accepted'],
                    acceptedAt: a['accepted_at'],
                    body: a['body'],
                    voteScore: a['vote_score'],
                    createdAt: a['created_at'],
                    updatedAt: a['updated_at'],
                    author: {
                        username: a['username'],
                        firstName: a['first_name'],
                        lastName: a['last_name'],
                        profilePicture: a['profile_picture'],
                    },
                })),
            },
            message: 'Answers retrieved successfully.',
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        return sendErrorResponse(res, 500, 'Internal Server Error');
    }
};

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
        
        if (answer['author_id'] !== userId) {
            return sendErrorResponse(res, 403, 'You are not authorized to edit this answer.');
        }
        
        const updatedAnswer = await AnswerModel.updateAnswer(answerId, body, userId);
        
        if (!updatedAnswer) {
            return sendErrorResponse(res, 424, 'Failed to update answer.');
        }
        
        return res.status(200).json({
            data: {
                answer: {
                    id: updatedAnswer['content_id'],
                    body: updatedAnswer['body'],
                    voteScore: updatedAnswer['vote_score'],
                    createdAt: updatedAnswer['created_at'],
                    updatedAt: updatedAnswer['updated_at'],
                    author: {
                        firstName: answer['first_name'],
                        lastName: answer['last_name'],
                        profilePicture: answer['profile_picture'],
                    },
                },
            },
            message: 'Answer updated successfully.',
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        if (error.message === 'UNAUTHORIZED_OR_NOT_FOUND') {
            return sendErrorResponse(res, 403, 'You are not authorized to edit this answer.');
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
        
        if (answer['author_id'] !== userId) {
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
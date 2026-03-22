import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

import {
    createQuestion,
    getQuestions,
    getQuestionById,
    editQuestion,
    deleteQuestion,
    updateQuestionViewCount
} from '../controllers/questionController.js';

import {
    questionSchema
} from "../validation/questionSchemas.js";
import {validateBody} from "../middleware/validate.js";
import {createAnswer, getAnswersByQuestionId} from "../controllers/answerController.js";
import {createComment, getCommentsByParentId} from "../controllers/commentController.js";
import {answerSchema} from "../validation/answerSchema.js";
import {commentSchema} from "../validation/commentSchema.js";

// Public routes
router.get('/', getQuestions);
router.get('/:questionId', getQuestionById);
router.get('/:questionId/answers', getAnswersByQuestionId);
router.get('/:questionId/comments', getCommentsByParentId);

// Authenticated routes
router.post('/', authMiddleware, validateBody(questionSchema), createQuestion);
router.put('/:questionId', authMiddleware, validateBody(questionSchema), editQuestion);
router.delete('/:questionId', authMiddleware, deleteQuestion);
router.post('/:questionId/answers', authMiddleware, validateBody(answerSchema), createAnswer);
router.post('/:questionId/comments', authMiddleware, validateBody(commentSchema), createComment);

export default router;

/**
 * // Authenticated operations
 * POST   /api/questions/:questionId/close      // Close question (moderator)
 * POST   /api/questions/:questionId/reopen     // Reopen question (moderator)
 */
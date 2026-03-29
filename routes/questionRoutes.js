import express from 'express';
import authMiddleware, { optionalAuthMiddleware, moderatorMiddleware } from "../middleware/authMiddleware.js";
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

// Public routes (with optional auth to detect moderators for bypass of frozen content filter)
router.get('/', optionalAuthMiddleware, getQuestions);
router.get('/:questionId', optionalAuthMiddleware, getQuestionById);
router.get('/:questionId/answers', optionalAuthMiddleware, getAnswersByQuestionId);
router.get('/:questionId/comments', optionalAuthMiddleware, getCommentsByParentId);

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
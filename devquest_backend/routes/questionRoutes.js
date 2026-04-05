import express from 'express';
import authMiddleware, { optionalAuthMiddleware } from "../middleware/authMiddleware.js";
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
import {createBounty} from "../controllers/bountyController.js";
import {bountySchema} from "../validation/bountySchema.js";

// Public routes with optionalAuthMiddleware to verify moderator or admin for frozen questions
router.get('/', optionalAuthMiddleware, getQuestions);
router.get('/:questionId', optionalAuthMiddleware, getQuestionById);
router.get('/:questionId/answers', optionalAuthMiddleware, getAnswersByQuestionId);
router.get('/:questionId/comments', optionalAuthMiddleware, getCommentsByParentId);

// View count route (accessible to everyone)
router.post('/:questionId/view', updateQuestionViewCount);

// Authenticated routes
router.post('/', authMiddleware, validateBody(questionSchema), createQuestion);
router.put('/:questionId', authMiddleware, validateBody(questionSchema), editQuestion);
router.delete('/:questionId', authMiddleware, deleteQuestion);
router.post('/:questionId/answers', authMiddleware, validateBody(answerSchema), createAnswer);
router.post('/:questionId/comments', authMiddleware, validateBody(commentSchema), createComment);
router.post('/:questionId/bounties', authMiddleware, validateBody(bountySchema), createBounty);

export default router;
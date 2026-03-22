// routes/answerRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();

import {
    editAnswer,
    deleteAnswer,
    getAnswerById, editAnswerAcceptanceStatus,
} from '../controllers/answerController.js';

import { answerSchema } from '../validation/answerSchema.js';
import { validateBody } from '../middleware/validate.js';
import {createComment, getCommentsByParentId} from "../controllers/commentController.js";
import {commentSchema} from "../validation/commentSchema.js";

// Public routes
router.get('/:answerId/comments', getCommentsByParentId);
router.get('/:answerId', getAnswerById);

// Authenticated routes
router.post('/:answerId/comments', authMiddleware, validateBody(commentSchema), createComment);
router.put('/:answerId', authMiddleware, validateBody(answerSchema), editAnswer);
router.delete('/:answerId', authMiddleware, deleteAnswer);
router.post('/:answerId/accept', authMiddleware, editAnswerAcceptanceStatus);
router.post('/:answerId/unaccept', authMiddleware, editAnswerAcceptanceStatus);

export default router;
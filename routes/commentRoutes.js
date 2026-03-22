// routes/commentRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();

import {
    getCommentById,
    editComment,
    deleteComment, getCommentsByParentId,
} from '../controllers/commentController.js';

import { commentSchema } from '../validation/commentSchema.js';
import { validateBody } from '../middleware/validate.js';

// Public routes
router.get('/:commentId', getCommentById);
router.get('/:commentId/replies', getCommentsByParentId);

// Authenticated routes
router.post('/:commentId', authMiddleware, validateBody(commentSchema), getCommentById);
router.put('/:commentId', authMiddleware, validateBody(commentSchema), editComment);
router.delete('/:commentId', authMiddleware, deleteComment);

export default router;
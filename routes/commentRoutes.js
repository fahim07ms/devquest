// routes/commentRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();

import {
    editComment,
    deleteComment,
} from '../controllers/commentController.js';

import { commentSchema } from '../validation/commentSchema.js';
import { validateBody } from '../middleware/validate.js';

// Authenticated routes
router.put('/:commentId', authMiddleware, validateBody(commentSchema), editComment);
router.delete('/:commentId', authMiddleware, deleteComment);

export default router;
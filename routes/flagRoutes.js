import express from 'express';
import authMiddleware, { moderatorMiddleware } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { createFlagSchema, reviewFlagSchema } from '../validation/flagSchema.js';
import {
    createFlag,
    getAllFlags,
    getFlagById,
    reviewFlag,
    unfreezeContent,
    deleteFlag,
} from '../controllers/flagController.js';

const router = express.Router();

router.post('/', authMiddleware, validateBody(createFlagSchema), createFlag);

// ── Moderator / Admin only ────────────────────────────────────────────────────
router.get('/', authMiddleware, moderatorMiddleware, getAllFlags);
router.get('/:flagId', authMiddleware, moderatorMiddleware, getFlagById);
router.put('/:flagId/review', authMiddleware, moderatorMiddleware, validateBody(reviewFlagSchema), reviewFlag);
router.patch('/content/:contentId/unfreeze', authMiddleware, moderatorMiddleware, unfreezeContent);
router.delete('/:flagId', authMiddleware, moderatorMiddleware, deleteFlag);

export default router;

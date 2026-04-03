import express from 'express';

const router = express.Router();
import tagController from '../controllers/tagController.js';
import authMiddleware from "../middleware/authMiddleware.js";

router.get('/', tagController.getTags);
router.get('/detailed', tagController.getDetailedTags);

// Authenticated Routes
router.get('/followed', authMiddleware, tagController.getFollowedTags);
router.post('/:tagId/follow', authMiddleware, tagController.followTag);
router.delete('/:tagId/follow', authMiddleware, tagController.unfollowTag);

export default router;
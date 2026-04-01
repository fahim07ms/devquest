import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getNotifications,
    markAsRead,
    markAllAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.patch('/read-all', authMiddleware, markAllAsRead);
router.patch('/:id/read', authMiddleware, markAsRead);

export default router;

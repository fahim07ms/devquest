import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    addBookmark,
    removeBookmark,
    checkBookmarkStatus,
    getUserBookmarks
} from '../controllers/bookmarkController.js';

const router = express.Router();

// Routes for listing user bookmarks
router.get('/', authMiddleware, getUserBookmarks);

// Routes for a specific content bookmark
router.post('/:contentId', authMiddleware, addBookmark);
router.delete('/:contentId', authMiddleware, removeBookmark);
router.get('/:contentId/status', authMiddleware, checkBookmarkStatus);

export default router;

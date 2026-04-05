import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getDashboardStats, getDashboardFeed } from '../controllers/dashboardController.js';

const router = express.Router();

// Both endpoints require authentication
router.get('/stats', authMiddleware, getDashboardStats);
router.get('/feed',  authMiddleware, getDashboardFeed);

export default router;
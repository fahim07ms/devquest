import express from 'express';
const router = express.Router();

import {
    register,
    login,
    logout,
    refreshAccessToken,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

router.post('/register', register);

router.post('/login', login);

router.get('/logout', authMiddleware, logout);

router.get('/refresh', refreshAccessToken);

export default router;
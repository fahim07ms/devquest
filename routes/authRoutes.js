import express from 'express';
const router = express.Router();

import {
    register,
    login,
    logout,
    refreshAccessToken,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import {loginSchema, registerSchema} from "../validation/authSchemas.js";

router.post('/register', validateBody(registerSchema), register);

router.post('/login', validateBody(loginSchema), login);

router.get('/logout', authMiddleware, logout);

router.get('/refresh', refreshAccessToken);

export default router;
import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

import {
    getUserDetails,
    updateUserProfile,
    getUserQuestions,
    getUserAnswers
} from '../controllers/userController.js';
import {validateBody} from "../middleware/validate.js";
import {profileUpdateSchema} from "../validation/userSchemas.js";

// Authenticated routes
router.get('/me', authMiddleware, getUserDetails);
router.put('/me', authMiddleware, validateBody(profileUpdateSchema), updateUserProfile);
router.put('/me/avatar', authMiddleware, updateUserProfile);

// Public routes
router.get('/:username', getUserDetails);
router.get('/:username/questions', getUserQuestions);
router.get('/:username/answers', getUserAnswers);

export default router;

// GET    /api/users/:username/badges    — badges earned
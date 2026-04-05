import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

import {
    getUserDetails,
    updateUserProfile,
    getUserQuestions,
    getUserAnswers, uploadProfileImage, getPublicProfile, getUserBadges, getMyReputationHistory
} from '../controllers/userController.js';
import {validateBody} from "../middleware/validate.js";
import {profileUpdateSchema} from "../validation/userSchemas.js";
import {upload} from "../middleware/upload.js";

// Authenticated routes
router.get('/me', authMiddleware, getUserDetails);
router.put('/me', authMiddleware, validateBody(profileUpdateSchema), updateUserProfile);
router.put('/me/avatar', authMiddleware, upload.single('avatar'), uploadProfileImage);
router.get('/me/reputation', authMiddleware, getMyReputationHistory);

// Public routes
router.get('/:username', getPublicProfile);
router.get('/:username/questions', getUserQuestions);
router.get('/:username/answers', getUserAnswers);
router.get('/:username/badges', getUserBadges);

export default router;

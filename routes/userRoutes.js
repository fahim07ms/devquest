import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

import {
    getUserDetails,
} from '../controllers/userController.js';


router.get('/me', authMiddleware, getUserDetails);

export default router;
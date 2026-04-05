import { Router } from 'express';
import {validateBody} from "../middleware/validate.js";
import {
    castVote, deleteVote, getVotesByContentId, updateVote, getUserVoteOnContent
} from '../controllers/voteController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { voteSchema } from '../validation/voteSchema.js';
const router = Router();

// Public routes
router.get('/', getVotesByContentId);

// Authenticated routes
router.post('/', authMiddleware, castVote);
router.put('/:voteId', authMiddleware, updateVote);
router.delete('/:voteId', authMiddleware, deleteVote);
router.get('/:contentId', authMiddleware, getUserVoteOnContent);


export default router;

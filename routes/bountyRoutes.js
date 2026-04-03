import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    createBounty,
    awardBounty
} from '../controllers/bountyController.js';

const router = express.Router({ mergeParams: true });

// To award bounty to an answer
router.patch('/:bountyId/award', authMiddleware, awardBounty);

export default router;

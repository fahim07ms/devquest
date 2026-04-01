import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    createBounty,
    awardBounty
} from '../controllers/bountyController.js';

const router = express.Router({ mergeParams: true });

// Routes for bounties
// Mounted at /api/bounties and /api/questions/:questionId/bounties

// To create
router.post('/', authMiddleware, createBounty);

// To award (assuming we mount this at /api/bounties)
router.patch('/:bountyId/award', authMiddleware, awardBounty);

export default router;

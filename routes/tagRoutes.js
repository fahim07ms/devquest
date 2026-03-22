import express from 'express';

const router = express.Router();
import tagController from '../controllers/tagController.js';

router.get('/', tagController.getTags);
router.get('/detailed', tagController.getDetailedTags)

export default router;
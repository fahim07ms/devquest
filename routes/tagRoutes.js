import express from 'express';

const router = express.Router();
import tagController from '../controllers/tagController.js';

router.get('/', tagController.getTags);

export default router;
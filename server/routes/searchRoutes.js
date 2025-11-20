import express from 'express';
import { aiSearch, textSearch } from '../controllers/searchController.js';

const router = express.Router();

router.post('/ai', aiSearch);
router.get('/text', textSearch);

export default router;


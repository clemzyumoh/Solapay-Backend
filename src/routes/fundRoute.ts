

// src/routes/fundRoute.ts

import express from 'express';
import { handleFundRequest } from '../controllers/fundController';

const router = express.Router();

// POST /api/fund
router.post('/fund', handleFundRequest);

export default router;

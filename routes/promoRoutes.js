import express from 'express';
import { 
  getPromoByCode,
  createPromoCode,
  getAllPromoCodes
} from '../controllers/promoController.js';

const router = express.Router();

router.get('/:code', getPromoByCode);
router.post('/', createPromoCode);
router.get('/', getAllPromoCodes);

export default router;
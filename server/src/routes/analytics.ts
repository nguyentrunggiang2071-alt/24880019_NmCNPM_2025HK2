import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';

const router = Router();
const controller = new AnalyticsController();

router.get('/top-tags', controller.getTopTags);
router.get('/trends', controller.getTrends);
router.get('/monthly', controller.getMonthlyCount);

export default router;

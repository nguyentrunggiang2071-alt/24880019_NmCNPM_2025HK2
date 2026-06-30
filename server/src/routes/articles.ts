import { Router } from 'express';
import { ArticleController } from '../controllers/ArticleController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const controller = new ArticleController();

router.get('/', controller.getArticles);
router.post('/ingest', controller.triggerIngest);
router.get('/search', controller.searchByKeywords);
router.get('/:id', controller.getArticleById);
router.get('/:id/related', controller.getRelated);
router.get('/:id/summary', authenticate, controller.getSummary);

export default router;

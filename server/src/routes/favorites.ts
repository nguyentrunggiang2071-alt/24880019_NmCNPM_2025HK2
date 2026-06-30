import { Router } from 'express';
import { FavoriteController } from '../controllers/FavoriteController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const controller = new FavoriteController();

router.use(authenticate);

router.get('/', controller.getFavorites);
router.post('/', controller.addFavorite);
router.get('/:articleId/check', controller.checkFavorite);
router.delete('/:articleId', controller.removeFavorite);

export default router;

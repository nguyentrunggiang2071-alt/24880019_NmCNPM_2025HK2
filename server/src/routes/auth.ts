import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const controller = new AuthController();

router.use(authenticate);

router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);

export default router;

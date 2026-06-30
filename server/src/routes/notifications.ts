import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const controller = new NotificationController();

router.use(authenticate);

router.get('/', controller.getNotifications);
router.get('/unread-count', controller.getUnreadCount);
router.put('/:id/read', controller.markRead);
router.put('/mark-all-read', controller.markAllRead);

export default router;

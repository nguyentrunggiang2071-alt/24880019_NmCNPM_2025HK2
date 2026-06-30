import { Router } from 'express';
import { TopicController } from '../controllers/TopicController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const controller = new TopicController();

router.use(authenticate);

router.get('/', controller.getTopics);
router.post('/', controller.createTopic);
router.put('/:id', controller.updateTopic);
router.delete('/:id', controller.deleteTopic);

export default router;

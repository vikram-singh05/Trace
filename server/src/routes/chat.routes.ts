import { Router } from 'express';
import { getConversations, getMessages, deleteConversation } from '../controllers/chat.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

router.get('/', getConversations);
router.get('/:conversationId/messages', getMessages);
router.delete('/:conversationId', deleteConversation);

export default router;

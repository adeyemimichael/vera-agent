import { Router } from 'express';
import { agentController } from '../controllers/agentController';

const router = Router();

// Agent routes
router.post('/agents/register', agentController.registerAgent);
router.get('/agents', agentController.getAllAgents);
router.get('/agents/:agentId', agentController.getAgent);

// Negotiation routes
router.post('/agents/start-negotiation', agentController.startNegotiation);
router.get('/negotiations', agentController.getAllSessions);
router.get('/negotiations/:sessionId', agentController.getNegotiationSession);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

import { Request, Response } from 'express';
import { negotiationService } from '../services/negotiationService';
import { AgentIdentity, AgentRole, AgentStatus } from '../types';
import { logger } from '../utils/logger';
import { z } from 'zod';

const registerAgentSchema = z.object({
  name: z.string().min(1),
  role: z.nativeEnum(AgentRole),
  owner: z.string(),
  publicKey: z.string(),
  metadataCID: z.string().optional()
});

export const agentController = {
  async registerAgent(req: Request, res: Response) {
    try {
      const validated = registerAgentSchema.parse(req.body);

      const agent: AgentIdentity = {
        agentId: `agent-${Date.now()}`,
        name: validated.name,
        role: validated.role,
        status: AgentStatus.Active,
        publicKey: validated.publicKey,
        owner: validated.owner,
        metadataCID: validated.metadataCID,
        reputationScore: 100,
        transactionCount: 0,
        registeredAt: new Date()
      };

      negotiationService.registerAgent(agent);

      logger.info(`[API] Agent registered: ${agent.agentId}`);

      res.status(201).json({
        success: true,
        data: agent
      });
    } catch (error) {
      logger.error('[API] Register agent error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request'
      });
    }
  },

  async getAllAgents(req: Request, res: Response) {
    try {
      const agents = negotiationService.getAllAgents();

      res.json({
        success: true,
        data: agents
      });
    } catch (error) {
      logger.error('[API] Get agents error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agents'
      });
    }
  },

  async getAgent(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const agent = negotiationService.getAgent(agentId);

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      logger.error('[API] Get agent error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agent'
      });
    }
  },

  async startNegotiation(req: Request, res: Response) {
    try {
      logger.info('[API] Starting negotiation...');

      const session = await negotiationService.startNegotiation();

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      logger.error('[API] Start negotiation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start negotiation'
      });
    }
  },

  async getNegotiationSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = negotiationService.getSession(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      logger.error('[API] Get session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch session'
      });
    }
  },

  async getAllSessions(req: Request, res: Response) {
    try {
      const sessions = negotiationService.getAllSessions();

      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      logger.error('[API] Get sessions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sessions'
      });
    }
  }
};

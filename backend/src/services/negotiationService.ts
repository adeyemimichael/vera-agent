import { v4 as uuidv4 } from 'uuid';
import { BuyerAgent } from '../agents/BuyerAgent';
import { SellerAgent } from '../agents/SellerAgent';
import { NegotiationSession, SignedMessage, MessageType, AgentIdentity, AgentRole, AgentStatus } from '../types';
import { hederaService } from './hederaService';
import { logger } from '../utils/logger';
import { hashMessage } from '../utils/crypto';

export class NegotiationService {
  private sessions: Map<string, NegotiationSession> = new Map();
  private agents: Map<string, AgentIdentity> = new Map();

  constructor() {
    this.initializeDemoAgents();
  }

  private initializeDemoAgents(): void {
    const buyerIdentity: AgentIdentity = {
      agentId: 'buyer-001',
      name: 'TechCorp Buyer Agent',
      role: AgentRole.Buyer,
      status: AgentStatus.Active,
      publicKey: 'buyer-public-key-demo',
      owner: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      reputationScore: 850,
      transactionCount: 42,
      registeredAt: new Date()
    };

    const sellerIdentity: AgentIdentity = {
      agentId: 'seller-001',
      name: 'CloudServices Seller Agent',
      role: AgentRole.Seller,
      status: AgentStatus.Active,
      publicKey: 'seller-public-key-demo',
      owner: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      reputationScore: 920,
      transactionCount: 156,
      registeredAt: new Date()
    };

    this.agents.set(buyerIdentity.agentId, buyerIdentity);
    this.agents.set(sellerIdentity.agentId, sellerIdentity);
  }

  async startNegotiation(): Promise<NegotiationSession> {
    const sessionId = uuidv4();
    const buyerIdentity = this.agents.get('buyer-001')!;
    const sellerIdentity = this.agents.get('seller-001')!;

    logger.info(`[Negotiation] Starting session ${sessionId}`);

    const session: NegotiationSession = {
      sessionId,
      buyerAgentId: buyerIdentity.agentId,
      sellerAgentId: sellerIdentity.agentId,
      status: 'active',
      messages: [],
      startedAt: new Date()
    };

    this.sessions.set(sessionId, session);

    // Create HCS topic for this session
    const topicId = await hederaService.createTopic();
    session.hcsTopicId = topicId;

    // Run negotiation in background (don't await)
    this.runNegotiation(session, buyerIdentity, sellerIdentity).catch(error => {
      logger.error('[Negotiation] Background error:', error);
      session.status = 'failed';
      session.completedAt = new Date();
    });

    return session;
  }

  private async runNegotiation(
    session: NegotiationSession,
    buyerIdentity: AgentIdentity,
    sellerIdentity: AgentIdentity
  ): Promise<void> {
    const buyer = new BuyerAgent(buyerIdentity, 120); // Max budget: 120
    const seller = new SellerAgent(sellerIdentity, 80); // Min price: 80

    try {
      // Buyer creates initial offer
      const initialOffer = await buyer.createInitialOffer({
        id: 'prod-001',
        name: 'Premium API Access',
        quantity: 1000
      });

      await this.processMessage(session, initialOffer);

      let currentMessage = initialOffer;
      let maxRounds = 10;
      let round = 0;

      while (session.status === 'active' && round < maxRounds) {
        round++;
        logger.info(`[Negotiation] Round ${round}`);

        // Seller perceives and responds
        const sellerPerception = seller.perceive(currentMessage);
        const sellerDecision = seller.decide(sellerPerception);
        const sellerResponse = await seller.act(sellerDecision);

        if (sellerResponse) {
          await this.processMessage(session, sellerResponse);
          currentMessage = sellerResponse;

          if (sellerResponse.type === MessageType.Accept) {
            session.status = 'completed';
            session.completedAt = new Date();
            session.finalPrice = sellerResponse.data.totalPrice;
            logger.info(`[Negotiation] Completed! Final price: ${session.finalPrice}`);
            break;
          }

          if (sellerResponse.type === MessageType.Reject) {
            session.status = 'failed';
            session.completedAt = new Date();
            logger.info('[Negotiation] Failed - Seller rejected');
            break;
          }
        } else {
          break;
        }

        // Buyer perceives and responds
        const buyerPerception = buyer.perceive(currentMessage);
        const buyerDecision = buyer.decide(buyerPerception, currentMessage.data);
        const buyerResponse = await buyer.act(buyerDecision);

        if (buyerResponse) {
          await this.processMessage(session, buyerResponse);
          currentMessage = buyerResponse;

          if (buyerResponse.type === MessageType.Accept) {
            session.status = 'completed';
            session.completedAt = new Date();
            session.finalPrice = buyerResponse.data.totalPrice;
            logger.info(`[Negotiation] Completed! Final price: ${session.finalPrice}`);
            break;
          }

          if (buyerResponse.type === MessageType.Reject) {
            session.status = 'failed';
            session.completedAt = new Date();
            logger.info('[Negotiation] Failed - Buyer rejected');
            break;
          }
        } else {
          break;
        }

        // Small delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (round >= maxRounds && session.status === 'active') {
        session.status = 'failed';
        session.completedAt = new Date();
        logger.info('[Negotiation] Failed - Max rounds reached');
      }

    } catch (error) {
      logger.error('[Negotiation] Error:', error);
      session.status = 'failed';
      session.completedAt = new Date();
    }
  }

  private async processMessage(session: NegotiationSession, message: SignedMessage): Promise<void> {
    // Add hash
    message.hash = hashMessage(message);

    // Add to session
    session.messages.push(message);

    // Log to HCS
    try {
      await hederaService.submitMessage(message);
      logger.info(`[Negotiation] Message logged to HCS: ${message.type}`);
    } catch (error) {
      logger.error('[Negotiation] Failed to log to HCS:', error);
    }
  }

  getSession(sessionId: string): NegotiationSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): NegotiationSession[] {
    return Array.from(this.sessions.values());
  }

  getAgent(agentId: string): AgentIdentity | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): AgentIdentity[] {
    return Array.from(this.agents.values());
  }

  registerAgent(agent: AgentIdentity): void {
    this.agents.set(agent.agentId, agent);
    logger.info(`[Negotiation] Agent registered: ${agent.agentId}`);
  }
}

export const negotiationService = new NegotiationService();

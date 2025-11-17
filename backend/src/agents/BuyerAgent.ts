import { AgentIdentity, SignedMessage, MessageType, NegotiationOffer, AgentRole, AgentStatus } from '../types';
import { signMessage, verifySignature } from '../utils/crypto';
import { logger } from '../utils/logger';

export class BuyerAgent {
  private identity: AgentIdentity;
  private maxBudget: number;
  private targetPrice: number;
  private maxCounterOffers: number;
  private counterOfferCount: number;

  constructor(identity: AgentIdentity, maxBudget: number) {
    this.identity = identity;
    this.maxBudget = maxBudget;
    this.targetPrice = maxBudget * 0.8; // Try to get 20% discount
    this.maxCounterOffers = 3;
    this.counterOfferCount = 0;
  }

  /**
   * Perceive: Analyze incoming message
   */
  perceive(message: SignedMessage): any {
    logger.info(`[BuyerAgent ${this.identity.agentId}] Perceiving message type: ${message.type}`);
    
    // Verify signature
    const isValid = verifySignature(message);
    if (!isValid) {
      logger.warn(`[BuyerAgent] Invalid signature from ${message.agentId}`);
      return null;
    }

    return {
      type: message.type,
      data: message.data,
      isValid,
      timestamp: message.timestamp
    };
  }

  /**
   * Decide: Make decision based on perception
   */
  decide(perception: any, currentOffer: NegotiationOffer): { action: string; data?: any } {
    if (!perception || !perception.isValid) {
      return { action: 'reject', data: { reason: 'Invalid message' } };
    }

    const { type, data } = perception;

    switch (type) {
      case MessageType.Offer:
        return this.evaluateOffer(data);
      
      case MessageType.Counter:
        return this.evaluateCounterOffer(data);
      
      case MessageType.Accept:
        return { action: 'complete', data: { status: 'accepted' } };
      
      case MessageType.Reject:
        return { action: 'terminate', data: { reason: 'Seller rejected' } };
      
      default:
        return { action: 'wait' };
    }
  }

  /**
   * Act: Execute decision
   */
  async act(decision: { action: string; data?: any }): Promise<SignedMessage | null> {
    logger.info(`[BuyerAgent ${this.identity.agentId}] Acting: ${decision.action}`);

    switch (decision.action) {
      case 'accept':
        return this.createAcceptMessage(decision.data);
      
      case 'counter':
        return this.createCounterOffer(decision.data);
      
      case 'reject':
        return this.createRejectMessage(decision.data);
      
      case 'complete':
      case 'terminate':
      case 'wait':
        return null;
      
      default:
        return null;
    }
  }

  /**
   * Create initial offer
   */
  async createInitialOffer(product: { id: string; name: string; quantity: number }): Promise<SignedMessage> {
    const offer: NegotiationOffer = {
      productId: product.id,
      productName: product.name,
      quantity: product.quantity,
      pricePerUnit: this.targetPrice / product.quantity,
      totalPrice: this.targetPrice,
      deliveryTerms: 'Standard delivery within 7 days'
    };

    return this.createSignedMessage(MessageType.Offer, offer);
  }

  /**
   * Evaluate seller's offer
   */
  private evaluateOffer(offer: NegotiationOffer): { action: string; data?: any } {
    logger.info(`[BuyerAgent] Evaluating offer: ${offer.totalPrice} (budget: ${this.maxBudget})`);

    if (offer.totalPrice <= this.targetPrice) {
      // Great deal!
      return { action: 'accept', data: offer };
    }

    if (offer.totalPrice <= this.maxBudget && this.counterOfferCount < this.maxCounterOffers) {
      // Try to negotiate
      const counterPrice = (offer.totalPrice + this.targetPrice) / 2;
      this.counterOfferCount++;
      
      return {
        action: 'counter',
        data: {
          ...offer,
          pricePerUnit: counterPrice / offer.quantity,
          totalPrice: counterPrice
        }
      };
    }

    if (offer.totalPrice <= this.maxBudget) {
      // Accept if within budget
      return { action: 'accept', data: offer };
    }

    // Too expensive
    return { action: 'reject', data: { reason: 'Price exceeds budget' } };
  }

  /**
   * Evaluate counter offer
   */
  private evaluateCounterOffer(offer: NegotiationOffer): { action: string; data?: any } {
    logger.info(`[BuyerAgent] Evaluating counter offer: ${offer.totalPrice}`);

    if (offer.totalPrice <= this.maxBudget) {
      return { action: 'accept', data: offer };
    }

    if (this.counterOfferCount < this.maxCounterOffers) {
      const counterPrice = Math.min(offer.totalPrice * 0.95, this.maxBudget);
      this.counterOfferCount++;
      
      return {
        action: 'counter',
        data: {
          ...offer,
          pricePerUnit: counterPrice / offer.quantity,
          totalPrice: counterPrice
        }
      };
    }

    return { action: 'reject', data: { reason: 'Cannot reach agreement' } };
  }

  /**
   * Create signed message
   */
  private async createSignedMessage(type: MessageType, data: any): Promise<SignedMessage> {
    const message: SignedMessage = {
      type,
      data,
      timestamp: Date.now(),
      agentId: this.identity.agentId,
      signature: ''
    };

    message.signature = signMessage(message);
    return message;
  }

  /**
   * Create accept message
   */
  private async createAcceptMessage(data: any): Promise<SignedMessage> {
    return this.createSignedMessage(MessageType.Accept, data);
  }

  /**
   * Create counter offer
   */
  private async createCounterOffer(data: any): Promise<SignedMessage> {
    return this.createSignedMessage(MessageType.Counter, data);
  }

  /**
   * Create reject message
   */
  private async createRejectMessage(data: any): Promise<SignedMessage> {
    return this.createSignedMessage(MessageType.Reject, data);
  }

  getIdentity(): AgentIdentity {
    return this.identity;
  }

  getCounterOfferCount(): number {
    return this.counterOfferCount;
  }

  resetCounterOffers(): void {
    this.counterOfferCount = 0;
  }
}

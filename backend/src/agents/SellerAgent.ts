import { AgentIdentity, SignedMessage, MessageType, NegotiationOffer, AgentRole, AgentStatus } from '../types';
import { signMessage, verifySignature } from '../utils/crypto';
import { logger } from '../utils/logger';

export class SellerAgent {
  private identity: AgentIdentity;
  private minPrice: number;
  private targetPrice: number;
  private maxCounterOffers: number;
  private counterOfferCount: number;
  private inventory: Map<string, { name: string; quantity: number; basePrice: number }>;

  constructor(identity: AgentIdentity, minPrice: number) {
    this.identity = identity;
    this.minPrice = minPrice;
    this.targetPrice = minPrice * 1.3; // Try to get 30% markup
    this.maxCounterOffers = 3;
    this.counterOfferCount = 0;
    this.inventory = new Map();
    
    // Initialize sample inventory
    this.inventory.set('prod-001', {
      name: 'Premium API Access',
      quantity: 1000,
      basePrice: 100
    });
  }

  perceive(message: SignedMessage): any {
    logger.info(`[SellerAgent ${this.identity.agentId}] Perceiving message type: ${message.type}`);
    
    const isValid = verifySignature(message);
    if (!isValid) {
      logger.warn(`[SellerAgent] Invalid signature from ${message.agentId}`);
      return null;
    }

    return {
      type: message.type,
      data: message.data,
      isValid,
      timestamp: message.timestamp
    };
  }

  decide(perception: any): { action: string; data?: any } {
    if (!perception || !perception.isValid) {
      return { action: 'reject', data: { reason: 'Invalid message' } };
    }

    const { type, data } = perception;

    switch (type) {
      case MessageType.Offer:
        return this.evaluateBuyerOffer(data);
      case MessageType.Counter:
        return this.evaluateCounterOffer(data);
      case MessageType.Accept:
        return { action: 'complete', data: { status: 'accepted' } };
      case MessageType.Reject:
        return { action: 'terminate', data: { reason: 'Buyer rejected' } };
      default:
        return { action: 'wait' };
    }
  }

  async act(decision: { action: string; data?: any }): Promise<SignedMessage | null> {
    logger.info(`[SellerAgent ${this.identity.agentId}] Acting: ${decision.action}`);

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

  async createInitialOffer(productId: string, quantity: number): Promise<SignedMessage> {
    const product = this.inventory.get(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const offer: NegotiationOffer = {
      productId,
      productName: product.name,
      quantity,
      pricePerUnit: this.targetPrice / quantity,
      totalPrice: this.targetPrice,
      deliveryTerms: 'Immediate delivery upon payment'
    };

    return this.createSignedMessage(MessageType.Offer, offer);
  }

  private evaluateBuyerOffer(offer: NegotiationOffer): { action: string; data?: any } {
    logger.info(`[SellerAgent] Evaluating buyer offer: ${offer.totalPrice} (min: ${this.minPrice})`);

    if (offer.totalPrice >= this.targetPrice) {
      return { action: 'accept', data: offer };
    }

    if (offer.totalPrice >= this.minPrice && this.counterOfferCount < this.maxCounterOffers) {
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

    if (offer.totalPrice >= this.minPrice) {
      return { action: 'accept', data: offer };
    }

    return { action: 'reject', data: { reason: 'Price below minimum' } };
  }

  private evaluateCounterOffer(offer: NegotiationOffer): { action: string; data?: any } {
    logger.info(`[SellerAgent] Evaluating counter offer: ${offer.totalPrice}`);

    if (offer.totalPrice >= this.minPrice) {
      return { action: 'accept', data: offer };
    }

    if (this.counterOfferCount < this.maxCounterOffers) {
      const counterPrice = Math.max(offer.totalPrice * 1.05, this.minPrice);
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

  private async createAcceptMessage(data: any): Promise<SignedMessage> {
    return this.createSignedMessage(MessageType.Accept, data);
  }

  private async createCounterOffer(data: any): Promise<SignedMessage> {
    return this.createSignedMessage(MessageType.Counter, data);
  }

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

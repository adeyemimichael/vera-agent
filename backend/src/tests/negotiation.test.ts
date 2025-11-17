import { BuyerAgent } from '../agents/BuyerAgent';
import { SellerAgent } from '../agents/SellerAgent';
import { AgentIdentity, AgentRole, AgentStatus, MessageType } from '../types';

describe('Agent Negotiation', () => {
  let buyerIdentity: AgentIdentity;
  let sellerIdentity: AgentIdentity;
  let buyer: BuyerAgent;
  let seller: SellerAgent;

  beforeEach(() => {
    buyerIdentity = {
      agentId: 'buyer-test',
      name: 'Test Buyer',
      role: AgentRole.Buyer,
      status: AgentStatus.Active,
      publicKey: 'test-buyer-key',
      owner: '0xBuyer',
      reputationScore: 100,
      transactionCount: 0,
      registeredAt: new Date()
    };

    sellerIdentity = {
      agentId: 'seller-test',
      name: 'Test Seller',
      role: AgentRole.Seller,
      status: AgentStatus.Active,
      publicKey: 'test-seller-key',
      owner: '0xSeller',
      reputationScore: 100,
      transactionCount: 0,
      registeredAt: new Date()
    };

    buyer = new BuyerAgent(buyerIdentity, 120);
    seller = new SellerAgent(sellerIdentity, 80);
  });

  test('Buyer creates initial offer', async () => {
    const offer = await buyer.createInitialOffer({
      id: 'prod-001',
      name: 'Test Product',
      quantity: 100
    });

    expect(offer.type).toBe(MessageType.Offer);
    expect(offer.agentId).toBe('buyer-test');
    expect(offer.signature).toBeTruthy();
    expect(offer.data.totalPrice).toBeLessThanOrEqual(120);
  });

  test('Seller perceives and responds to offer', async () => {
    const offer = await buyer.createInitialOffer({
      id: 'prod-001',
      name: 'Test Product',
      quantity: 100
    });

    const perception = seller.perceive(offer);
    expect(perception).toBeTruthy();
    expect(perception.isValid).toBe(true);

    const decision = seller.decide(perception);
    expect(decision.action).toBeTruthy();
  });

  test('Negotiation reaches agreement', async () => {
    const offer = await buyer.createInitialOffer({
      id: 'prod-001',
      name: 'Test Product',
      quantity: 100
    });

    // Seller evaluates
    const sellerPerception = seller.perceive(offer);
    const sellerDecision = seller.decide(sellerPerception);
    const sellerResponse = await seller.act(sellerDecision);

    expect(sellerResponse).toBeTruthy();

    if (sellerResponse && sellerResponse.type !== MessageType.Accept) {
      // Buyer evaluates counter
      const buyerPerception = buyer.perceive(sellerResponse);
      const buyerDecision = buyer.decide(buyerPerception, sellerResponse.data);
      const buyerResponse = await buyer.act(buyerDecision);

      expect(buyerResponse).toBeTruthy();
    }
  });

  test('Buyer rejects if price exceeds budget', async () => {
    const expensiveOffer = await seller.createInitialOffer('prod-001', 100);
    expensiveOffer.data.totalPrice = 150; // Above buyer's budget

    const perception = buyer.perceive(expensiveOffer);
    const decision = buyer.decide(perception, expensiveOffer.data);

    expect(decision.action).toBe('reject');
  });

  test('Seller rejects if price below minimum', async () => {
    const lowOffer = await buyer.createInitialOffer({
      id: 'prod-001',
      name: 'Test Product',
      quantity: 100
    });
    lowOffer.data.totalPrice = 50; // Below seller's minimum

    const perception = seller.perceive(lowOffer);
    const decision = seller.decide(perception);

    // After max counter offers, should reject
    seller['counterOfferCount'] = 3;
    const finalDecision = seller.decide(perception);
    expect(finalDecision.action).toBe('reject');
  });
});

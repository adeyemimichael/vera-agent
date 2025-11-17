export enum AgentRole {
  Buyer = 'buyer',
  Seller = 'seller',
  Both = 'both'
}

export enum AgentStatus {
  Inactive = 'inactive',
  Active = 'active',
  Negotiating = 'negotiating',
  Suspended = 'suspended'
}

export enum MessageType {
  Offer = 'offer',
  Counter = 'counter',
  Accept = 'accept',
  Reject = 'reject',
  Delivery = 'delivery'
}

export interface AgentIdentity {
  agentId: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  publicKey: string;
  owner: string;
  metadataCID?: string;
  reputationScore: number;
  transactionCount: number;
  registeredAt: Date;
}

export interface SignedMessage {
  type: MessageType;
  data: any;
  timestamp: number;
  agentId: string;
  signature: string;
  hash?: string;
}

export interface NegotiationOffer {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  deliveryTerms: string;
}

export interface NegotiationSession {
  sessionId: string;
  buyerAgentId: string;
  sellerAgentId: string;
  status: 'active' | 'completed' | 'failed';
  messages: SignedMessage[];
  startedAt: Date;
  completedAt?: Date;
  finalPrice?: number;
  hcsTopicId?: string;
}

export interface PaymentSettlement {
  sessionId: string;
  transactionId: string;
  amount: number;
  from: string;
  to: string;
  timestamp: Date;
  hcsMessageId?: string;
}

export interface HCSLogEntry {
  topicId: string;
  sequenceNumber: number;
  message: string;
  timestamp: Date;
  consensusTimestamp: string;
}

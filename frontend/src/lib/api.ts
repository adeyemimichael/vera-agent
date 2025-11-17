const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface Agent {
  agentId: string;
  name: string;
  role: 'buyer' | 'seller' | 'both';
  status: string;
  publicKey: string;
  owner: string;
  metadataCID?: string;
  reputationScore: number;
  transactionCount: number;
  registeredAt: string;
}

export interface NegotiationSession {
  sessionId: string;
  buyerAgentId: string;
  sellerAgentId: string;
  status: 'active' | 'completed' | 'failed';
  messages: SignedMessage[];
  startedAt: string;
  completedAt?: string;
  finalPrice?: number;
  hcsTopicId?: string;
}

export interface SignedMessage {
  type: 'offer' | 'counter' | 'accept' | 'reject' | 'delivery';
  data: any;
  timestamp: number;
  agentId: string;
  signature: string;
  hash?: string;
}

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  async getAgents(): Promise<Agent[]> {
    const result = await fetchAPI('/agents');
    return result.data;
  },

  async getAgent(agentId: string): Promise<Agent> {
    const result = await fetchAPI(`/agents/${agentId}`);
    return result.data;
  },

  async registerAgent(agent: Partial<Agent>): Promise<Agent> {
    const result = await fetchAPI('/agents/register', {
      method: 'POST',
      body: JSON.stringify(agent)
    });
    return result.data;
  },

  async startNegotiation(): Promise<NegotiationSession> {
    const result = await fetchAPI('/agents/start-negotiation', {
      method: 'POST'
    });
    return result.data;
  },

  async getNegotiations(): Promise<NegotiationSession[]> {
    const result = await fetchAPI('/negotiations');
    return result.data;
  },

  async getNegotiation(sessionId: string): Promise<NegotiationSession> {
    const result = await fetchAPI(`/negotiations/${sessionId}`);
    return result.data;
  }
};

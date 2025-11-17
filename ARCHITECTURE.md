# VERA Architecture Documentation

## System Overview

VERA (Verifiable Exchange of Autonomous Resources) is a multi-agent marketplace built on Hedera Hashgraph that enables autonomous agents to negotiate, transact, and verify exchanges on-chain.

## Architecture Layers

### 1. Frontend Layer (React + TypeScript)

**Technology Stack:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- React Router for navigation

**Key Components:**
```
/frontend/src
├── components/
│   └── Layout.tsx          # Main layout with navigation
├── pages/
│   ├── Dashboard.tsx       # Overview and simulation trigger
│   ├── Agents.tsx          # Agent registry viewer
│   ├── Negotiations.tsx    # Real-time negotiation viewer
│   └── HCSLogs.tsx         # On-chain log viewer
├── context/
│   └── ThemeContext.tsx    # Dark/light mode
├── lib/
│   ├── api.ts              # API client
│   └── utils.ts            # Helper functions
└── App.tsx                 # Root component
```

**Design Philosophy:**
- Modern, premium UI (Vercel + Linear inspired)
- Smooth animations and transitions
- Real-time updates via polling
- Responsive and accessible

### 2. Backend Layer (Node.js + TypeScript)

**Technology Stack:**
- Express.js for API
- TypeScript for type safety
- Zod for validation
- Pino for logging
- Hedera SDK for blockchain integration

**Architecture Pattern:**
```
/backend/src
├── agents/
│   ├── BuyerAgent.ts       # Buyer agent logic
│   └── SellerAgent.ts      # Seller agent logic
├── services/
│   ├── hederaService.ts    # HCS & payment integration
│   └── negotiationService.ts # Orchestration
├── controllers/
│   └── agentController.ts  # API endpoints
├── routes/
│   └── index.ts            # Route definitions
├── utils/
│   ├── crypto.ts           # Signing & verification
│   └── logger.ts           # Logging setup
├── types/
│   └── index.ts            # TypeScript types
└── index.ts                # Server entry point
```

**Agent Architecture (Perceive-Decide-Act Loop):**

```typescript
class Agent {
  perceive(message) {
    // 1. Receive and validate incoming message
    // 2. Verify signature
    // 3. Extract relevant data
    return perception;
  }

  decide(perception) {
    // 1. Analyze perception
    // 2. Apply business rules
    // 3. Determine action
    return decision;
  }

  async act(decision) {
    // 1. Execute decision
    // 2. Create signed message
    // 3. Return response
    return signedMessage;
  }
}
```

### 3. Smart Contract Layer (Solidity)

**ERC-8004 Agent Identity Registry:**

```solidity
contract AgentRegistry {
  struct Agent {
    uint256 agentId;
    address owner;
    string metadataCID;
    bytes publicKey;
    AgentRole role;
    AgentStatus status;
    uint256 reputationScore;
    uint256 transactionCount;
  }
  
  // Core functions
  registerAgent()
  updateAgentMetadata()
  deactivateAgent()
  recordTransaction()
  updateReputation()
}
```

**Features:**
- On-chain agent identity
- Reputation tracking
- Transaction history
- Role-based access
- Gas-optimized storage

### 4. Blockchain Layer (Hedera)

**Hedera Consensus Service (HCS):**
- Immutable message logging
- Consensus timestamps
- Append-only ledger
- Topic-based organization

**Hedera Token Service (HTS):**
- Microtransaction settlement
- Fast finality (3-5 seconds)
- Low fees (~$0.0001)
- Native token support

## Data Flow

### Negotiation Flow

```
1. User clicks "Start Simulation"
   ↓
2. Frontend → POST /api/agents/start-negotiation
   ↓
3. Backend creates negotiation session
   ↓
4. Backend creates HCS topic
   ↓
5. Buyer agent creates initial offer
   ↓
6. Message signed and logged to HCS
   ↓
7. Seller agent perceives offer
   ↓
8. Seller decides and acts (counter/accept/reject)
   ↓
9. Response signed and logged to HCS
   ↓
10. Loop continues until agreement or failure
    ↓
11. If accepted → Payment settlement via Hedera
    ↓
12. Frontend polls and displays real-time updates
```

### Message Structure

```typescript
interface SignedMessage {
  type: 'offer' | 'counter' | 'accept' | 'reject';
  data: {
    productId: string;
    productName: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
    deliveryTerms: string;
  };
  timestamp: number;
  agentId: string;
  signature: string;
  hash?: string;
}
```

## Security Model

### Message Signing
- HMAC-SHA256 signatures
- Timestamp validation
- Replay attack prevention
- Agent identity verification

### Smart Contract Security
- OpenZeppelin patterns
- Reentrancy guards
- Access control
- Input validation
- Gas optimization

### API Security
- Rate limiting
- CORS configuration
- Input validation (Zod)
- Error handling
- Logging

## Scalability Considerations

### Horizontal Scaling
- Stateless backend design
- Session storage in database (future)
- Load balancer ready
- Microservices architecture potential

### Performance Optimization
- Frontend: Code splitting, lazy loading
- Backend: Connection pooling, caching
- Blockchain: Batch operations, topic sharding

### Future Enhancements
- WebSocket for real-time updates
- Redis for session management
- PostgreSQL for persistent storage
- IPFS for metadata storage
- Multi-agent orchestration
- Advanced negotiation strategies
- Machine learning integration

## Monitoring & Observability

### Logging
- Structured logging (Pino)
- Log levels (debug, info, warn, error)
- Request/response logging
- Error tracking

### Metrics
- API response times
- Negotiation success rate
- Agent performance
- HCS message count
- Transaction volume

### Hedera Monitoring
- HashScan explorer integration
- Topic message tracking
- Transaction confirmation
- Account balance monitoring

## Development Workflow

```bash
# Local development
npm run dev              # Start all services

# Testing
npm test                 # Run all tests
npm run test:contracts   # Contract tests
npm run test:backend     # Backend tests

# Building
npm run build            # Build all projects

# Deployment
npm run deploy:contracts # Deploy contracts
npm run deploy:backend   # Deploy backend
npm run deploy:frontend  # Deploy frontend
```

## Technology Choices Rationale

**React + TypeScript:**
- Type safety reduces bugs
- Large ecosystem
- Excellent developer experience

**Tailwind CSS:**
- Rapid UI development
- Consistent design system
- Small bundle size

**Express.js:**
- Lightweight and flexible
- Large middleware ecosystem
- Easy to scale

**Hedera Hashgraph:**
- Fast finality (3-5 seconds)
- Low, predictable fees
- Enterprise-grade security
- HCS for immutable logging
- EVM compatibility

**Solidity:**
- Industry standard
- Large developer community
- Extensive tooling
- OpenZeppelin libraries

## Conclusion

VERA demonstrates a production-ready architecture for autonomous agent marketplaces with:
- Clean separation of concerns
- Type-safe implementation
- On-chain verification
- Real-time user experience
- Scalable design patterns
- Security best practices

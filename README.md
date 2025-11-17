# VERA — Verifiable Exchange of Autonomous Resources

A multi-agent marketplace with Hedera on-chain verification, microtransaction settlement, and modern dashboard.

## 🎯 Features

- **Multi-Agent Marketplace**: Autonomous buyer/seller agents with rule-based negotiation
- **Hedera Integration**: HCS logging, microtransactions, and on-chain verification
- **ERC-8004 Agent Registry**: Smart contract-based agent identity management
- **Modern Dashboard**: Beautiful React UI with real-time negotiation viewer

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Hedera testnet account
- MetaMask or similar wallet

### Installation

```bash
# Install all dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your Hedera credentials

# Deploy smart contracts
cd contracts
npm run deploy

# Start backend
cd ../backend
npm run dev

# Start frontend (in new terminal)
cd ../frontend
npm run dev
```

Visit `http://localhost:5173` to see the dashboard.

## 📁 Project Structure

```
/frontend       - React + TypeScript + Tailwind UI
/backend        - Node.js + TypeScript agent system
/contracts      - Solidity ERC-8004 agent registry
```

## 🧪 Testing

```bash
# Test contracts
cd contracts && npm test

# Test backend
cd backend && npm test

# Run simulation
curl -X POST http://localhost:3000/agents/start-negotiation
```

## 🏗️ Architecture

- **Frontend**: React 18, TypeScript, Tailwind, Framer Motion, Shadcn UI
- **Backend**: Node.js, Express, TypeScript, Hedera SDK, Zod validation
- **Contracts**: Solidity 0.8.x, Hardhat, OpenZeppelin
- **Blockchain**: Hedera Hashgraph (HCS + EVM)

## 📝 License

MIT

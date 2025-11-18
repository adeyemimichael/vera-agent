# VERA — Verifiable Exchange of Autonomous Resources

A production-grade multi-agent marketplace with Hedera on-chain verification, microtransaction settlement, and beautiful modern dashboard.

## 🎯 Features

- **Multi-Agent Marketplace**: Autonomous buyer/seller agents with rule-based negotiation
- **Hedera Integration**: HCS logging, microtransactions, and on-chain verification
- **ERC-8004 Agent Registry**: Smart contract-based agent identity management
- **Modern Dashboard**: Beautiful React UI with real-time negotiation viewer
- **Demo Mode**: Works without Hedera credentials for instant testing

## ⚡ Quick Start (2 Minutes)

### Prerequisites
- Node.js 18+ installed

### Installation & Run

```bash
# 1. Setup (installs dependencies and creates .env files)
npm run setup

# 2. Start everything (backend + frontend)
npm run dev
```

**That's it!** Open http://localhost:5174 in your browser.

### What You'll See
- ✅ Beautiful dashboard with gradient UI
- ✅ "Start Simulation" button - click to watch agents negotiate
- ✅ Real-time negotiation viewer with chat-style messages
- ✅ Agent profiles with reputation scores
- ✅ HCS logs with on-chain verification
- ✅ Dark/light mode toggle

### Demo Mode
The app runs in **demo mode** by default (no Hedera account needed):
- ✅ All UI features work
- ✅ Agent negotiation works
- ✅ Real-time updates work
- ⚠️ HCS logging is simulated
- ⚠️ Payments are simulated

### Enable Full Hedera Integration (Optional)

1. Get free testnet account: https://portal.hedera.com/
2. Edit `backend/.env`:
   ```env
   HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
   HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
   ```
3. Restart backend - real HCS logging enabled!

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

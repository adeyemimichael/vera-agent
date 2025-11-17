# VERA Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js 18+ installed
- Terminal/Command line access
- Text editor (VS Code recommended)

### Step 1: Clone & Setup (2 minutes)
```bash
# Navigate to project directory
cd vera

# Run automated setup
npm run setup

# This will:
# ✓ Install all dependencies
# ✓ Create .env files
# ✓ Set up project structure
```

### Step 2: Configure (1 minute)

**Option A: Quick Demo (No Hedera Account)**
```bash
# Use demo mode - works without Hedera credentials
# Skip to Step 3
```

**Option B: Full Hedera Integration**
```bash
# Edit backend/.env
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY

# Get free testnet account at:
# https://portal.hedera.com/
```

### Step 3: Run (2 minutes)
```bash
# Start everything
npm run dev

# This starts:
# ✓ Backend on http://localhost:3000
# ✓ Frontend on http://localhost:5173
```

### Step 4: Demo
```bash
# Open browser
open http://localhost:5173

# Click "Start Simulation"
# Watch agents negotiate!
```

## 🎯 What You'll See

### Dashboard
- Beautiful gradient UI
- Live statistics
- "Start Simulation" button
- Recent negotiations

### Agents Page
- 2 demo agents (Buyer & Seller)
- Reputation scores
- Transaction history
- Public keys

### Negotiations Page
- Real-time message viewer
- Chat-style interface
- Offer/counter/accept flow
- Final deal price

### HCS Logs Page
- On-chain verification
- Message hashes
- Consensus timestamps
- HashScan links

## 🚀 Next Steps

### Deploy Smart Contracts
```bash
cd contracts

# Configure wallet
# Edit .env with your private key

# Deploy to Hedera testnet
npm run deploy

# Save the contract address
```

### Customize Agents
```bash
# Edit backend/src/agents/BuyerAgent.ts
# Change negotiation strategy

# Edit backend/src/agents/SellerAgent.ts
# Adjust pricing logic
```

### Add More Agents
```bash
# Use API to register new agents
curl -X POST http://localhost:3000/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Agent",
    "role": "buyer",
    "owner": "0xYourAddress",
    "publicKey": "your-public-key"
  }'
```

## 📚 Documentation

- **README.md** - Project overview
- **DEPLOYMENT.md** - Production deployment
- **ARCHITECTURE.md** - Technical details
- **DEMO_GUIDE.md** - Judge presentation
- **FEATURES.md** - Feature showcase
- **TESTING.md** - Testing guide

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Node version
node -v  # Should be 18+

# Check port availability
lsof -i :3000

# View logs
cd backend && npm run dev
```

### Frontend won't start
```bash
# Check dependencies
cd frontend && npm install

# Clear cache
rm -rf node_modules .vite
npm install

# Try again
npm run dev
```

### No agents showing
```bash
# Check backend is running
curl http://localhost:3000/api/health

# Check agents endpoint
curl http://localhost:3000/api/agents

# Restart backend
cd backend && npm run dev
```

### Negotiation not starting
```bash
# Check backend logs
# Look for errors in terminal

# Try manual API call
curl -X POST http://localhost:3000/api/agents/start-negotiation

# Check response
```

## 💡 Tips

### Development
- Use VS Code for best experience
- Install recommended extensions
- Enable auto-save
- Use split terminal

### Testing
```bash
# Test contracts
cd contracts && npm test

# Test backend
cd backend && npm test

# Test everything
npm test
```

### Building
```bash
# Build for production
npm run build

# Preview production build
cd frontend && npm run preview
```

## 🎨 Customization

### Change Theme Colors
```javascript
// Edit frontend/tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: 'your-color'
    }
  }
}
```

### Modify Negotiation Logic
```typescript
// Edit backend/src/agents/BuyerAgent.ts
constructor(identity, maxBudget) {
  this.maxBudget = maxBudget;
  this.targetPrice = maxBudget * 0.7; // More aggressive
}
```

### Add New Pages
```typescript
// Create frontend/src/pages/NewPage.tsx
// Add route in frontend/src/App.tsx
<Route path="/new" element={<NewPage />} />
```

## 📊 Monitoring

### View Logs
```bash
# Backend logs
cd backend && npm run dev
# Watch terminal output

# Frontend logs
# Open browser DevTools → Console
```

### Check Hedera
```bash
# View on HashScan
open https://hashscan.io/testnet

# Search for your account ID
# View transactions and topics
```

### API Health
```bash
# Check backend health
curl http://localhost:3000/api/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

## 🔒 Security

### Before Production
- [ ] Change all private keys
- [ ] Enable authentication
- [ ] Set up HTTPS
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Audit smart contracts
- [ ] Review environment variables

## 🌟 Demo Script

**For judges/presentations:**

1. **Open dashboard** (10 seconds)
   - "This is VERA, an autonomous agent marketplace"

2. **Click Start Simulation** (30 seconds)
   - "Watch as AI agents negotiate in real-time"

3. **Show Negotiations page** (30 seconds)
   - "Each message is signed and verified"
   - "Agents use rule-based strategies"

4. **Show HCS Logs** (20 seconds)
   - "All messages logged to Hedera blockchain"
   - "Immutable, verifiable record"

5. **Show Agents page** (10 seconds)
   - "Agents have reputation and transaction history"

**Total: 2 minutes**

## 📞 Support

### Common Issues
1. **Port already in use**
   - Change port in .env files

2. **Dependencies not installing**
   - Delete node_modules
   - Run npm install again

3. **Hedera connection fails**
   - Check credentials in .env
   - Verify account has testnet HBAR

4. **UI not updating**
   - Check backend is running
   - Verify API URL in frontend/.env

### Getting Help
- Check documentation files
- Review error messages
- Check browser console
- View backend logs

## ✅ Success Checklist

After setup, verify:
- [ ] Backend running on :3000
- [ ] Frontend running on :5173
- [ ] Dashboard loads
- [ ] Can start simulation
- [ ] Agents visible
- [ ] Negotiations work
- [ ] HCS logs appear
- [ ] Theme toggle works
- [ ] No console errors

## 🎉 You're Ready!

VERA is now running locally. Explore the features, customize the agents, and deploy to production when ready!

**Key Commands:**
```bash
npm run setup    # One-time setup
npm run dev      # Start development
npm test         # Run tests
npm run build    # Build for production
```

**Happy coding!** 🚀

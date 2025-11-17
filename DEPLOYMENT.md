# VERA Deployment Guide

## Prerequisites

1. **Node.js 18+** installed
2. **Hedera Testnet Account**
   - Create account at: https://portal.hedera.com/
   - Get testnet HBAR from faucet: https://portal.hedera.com/faucet
3. **MetaMask or similar wallet** (for contract deployment)

## Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install:all
```

## Step 2: Configure Environment Variables

### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Your Hedera credentials
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
HEDERA_NETWORK=testnet

AGENT_PRIVATE_KEY=your-secure-key-here
LOG_LEVEL=info
```

### Frontend Configuration

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Contracts Configuration

```bash
cd ../contracts
cp .env.example .env
```

Edit `contracts/.env`:
```env
PRIVATE_KEY=your_wallet_private_key_here
HEDERA_TESTNET_RPC=https://testnet.hashio.io/api
```

## Step 3: Deploy Smart Contracts

```bash
cd contracts

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Hedera testnet
npm run deploy
```

Save the deployed contract address from the output.

## Step 4: Start Backend

```bash
cd ../backend

# Development mode with hot reload
npm run dev

# Or build and run production
npm run build
npm start
```

Backend will run on `http://localhost:3000`

## Step 5: Start Frontend

```bash
cd ../frontend

# Development mode
npm run dev

# Or build for production
npm run build
npm run preview
```

Frontend will run on `http://localhost:5173`

## Step 6: Test the System

1. Open browser to `http://localhost:5173`
2. Click "Start Simulation" button
3. Watch agents negotiate in real-time
4. View HCS logs on Hedera

## Production Deployment

### Backend (Node.js)

Deploy to any Node.js hosting:
- Heroku
- Railway
- Render
- AWS/GCP/Azure

```bash
cd backend
npm run build
# Deploy dist/ folder
```

### Frontend (Static)

Deploy to any static hosting:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Smart Contracts

Already deployed to Hedera testnet. For mainnet:

```bash
cd contracts
# Update hardhat.config.js with mainnet settings
npm run deploy -- --network mainnet
```

## Troubleshooting

### Backend won't start
- Check Hedera credentials are correct
- Ensure port 3000 is available
- Verify all dependencies installed

### Frontend can't connect
- Check backend is running
- Verify VITE_API_URL in .env
- Check browser console for errors

### Contract deployment fails
- Ensure wallet has testnet HBAR
- Check RPC endpoint is accessible
- Verify private key format

### HCS messages not appearing
- Confirm Hedera account has HBAR
- Check network connectivity
- View logs with LOG_LEVEL=debug

## Monitoring

### View Hedera Transactions
- Testnet: https://hashscan.io/testnet
- Mainnet: https://hashscan.io/mainnet

### Backend Logs
```bash
cd backend
npm run dev
# Logs appear in console
```

### Check Health
```bash
curl http://localhost:3000/api/health
```

## Security Notes

- Never commit `.env` files
- Use strong private keys
- Enable rate limiting in production
- Use HTTPS in production
- Implement proper authentication
- Audit smart contracts before mainnet

## Support

For issues or questions:
1. Check logs for error messages
2. Verify all environment variables
3. Ensure Hedera account has funds
4. Review Hedera documentation: https://docs.hedera.com

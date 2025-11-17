import crypto from 'crypto';
import { SignedMessage } from '../types';

const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY || 'demo-private-key-change-in-production';

export function signMessage(message: Omit<SignedMessage, 'signature'>): string {
  const payload = JSON.stringify({
    type: message.type,
    data: message.data,
    timestamp: message.timestamp,
    agentId: message.agentId
  });

  const hash = crypto.createHash('sha256').update(payload).digest('hex');
  const signature = crypto
    .createHmac('sha256', PRIVATE_KEY)
    .update(hash)
    .digest('hex');

  return signature;
}

export function verifySignature(message: SignedMessage): boolean {
  const expectedSignature = signMessage({
    type: message.type,
    data: message.data,
    timestamp: message.timestamp,
    agentId: message.agentId
  });

  return expectedSignature === message.signature;
}

export function hashMessage(message: SignedMessage): string {
  const payload = JSON.stringify(message);
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  return { publicKey, privateKey };
}

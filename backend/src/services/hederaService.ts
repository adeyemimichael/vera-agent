import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  AccountId,
  PrivateKey,
  TransferTransaction,
  Hbar
} from '@hashgraph/sdk';
import { logger } from '../utils/logger';
import { SignedMessage, HCSLogEntry } from '../types';

export class HederaService {
  private client: Client | null = null;
  private operatorId: AccountId | null = null;
  private operatorKey: PrivateKey | null = null;
  private topicId: string | null = null;
  private isConfigured: boolean = false;

  constructor() {
    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY;
    
    console.log('HederaService constructor - accountId:', accountId);
    console.log('HederaService constructor - privateKey length:', privateKey?.length);

    if (!accountId || !privateKey) {
      logger.warn('[Hedera] Credentials not configured - running in demo mode');
      logger.warn('[Hedera] HCS logging and payments will be simulated');
      this.isConfigured = false;
      return;
    }

    try {
      this.operatorId = AccountId.fromString(accountId);
      this.operatorKey = PrivateKey.fromString(privateKey);

      // Initialize client for testnet
      this.client = Client.forTestnet();
      this.client.setOperator(this.operatorId, this.operatorKey);
      this.isConfigured = true;
      logger.info('[Hedera] Successfully configured with real credentials');
    } catch (error) {
      logger.error('[Hedera] Failed to initialize:', error);
      logger.error('[Hedera] Account ID format should be: 0.0.12345');
      logger.error('[Hedera] Private Key format should start with: 302e');
      this.isConfigured = false;
    }
  }

  async createTopic(): Promise<string> {
    if (!this.isConfigured || !this.client || !this.operatorKey) {
      // Demo mode - generate fake topic ID
      this.topicId = `0.0.${Math.floor(Math.random() * 1000000)}`;
      logger.info(`[Hedera] Demo mode - simulated topic: ${this.topicId}`);
      return this.topicId;
    }

    try {
      logger.info('[Hedera] Creating HCS topic...');

      const transaction = new TopicCreateTransaction()
        .setSubmitKey(this.operatorKey.publicKey)
        .setAdminKey(this.operatorKey.publicKey);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      this.topicId = receipt.topicId!.toString();
      logger.info(`[Hedera] Topic created: ${this.topicId}`);

      return this.topicId;
    } catch (error: any) {
      logger.error('[Hedera] Failed to create topic:', error);
      logger.error('[Hedera] Error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name
      });
      throw error;
    }
  }

  async submitMessage(message: SignedMessage): Promise<string> {
    if (!this.topicId) {
      await this.createTopic();
    }

    if (!this.isConfigured || !this.client) {
      // Demo mode - simulate message submission
      const sequence = Math.floor(Math.random() * 1000).toString();
      logger.info(`[Hedera] Demo mode - simulated message submission. Sequence: ${sequence}`);
      return sequence;
    }

    try {
      logger.info(`[Hedera] Submitting message to topic ${this.topicId}`);

      const messageString = JSON.stringify(message);
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId!)
        .setMessage(messageString);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      logger.info(`[Hedera] Message submitted. Sequence: ${receipt.topicSequenceNumber}`);

      return receipt.topicSequenceNumber?.toString() || '';
    } catch (error) {
      logger.error('[Hedera] Failed to submit message:', error);
      throw error;
    }
  }

  async sendPayment(toAccountId: string, amount: number): Promise<string> {
    if (!this.isConfigured || !this.client || !this.operatorId) {
      // Demo mode - simulate payment
      const txId = `0.0.${Math.floor(Math.random() * 1000000)}@${Date.now()}`;
      logger.info(`[Hedera] Demo mode - simulated payment of ${amount} HBAR to ${toAccountId}`);
      return txId;
    }

    try {
      logger.info(`[Hedera] Sending ${amount} HBAR to ${toAccountId}`);

      const transaction = new TransferTransaction()
        .addHbarTransfer(this.operatorId, new Hbar(-amount))
        .addHbarTransfer(AccountId.fromString(toAccountId), new Hbar(amount));

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      logger.info(`[Hedera] Payment successful. Status: ${receipt.status}`);

      return txResponse.transactionId.toString();
    } catch (error) {
      logger.error('[Hedera] Payment failed:', error);
      throw error;
    }
  }

  async getTopicMessages(limit: number = 10): Promise<HCSLogEntry[]> {
    // Note: In production, use Mirror Node API to query messages
    // This is a placeholder implementation
    logger.info(`[Hedera] Fetching topic messages (limit: ${limit})`);
    
    return [];
  }

  getTopicId(): string | null {
    return this.topicId;
  }

  async close(): Promise<void> {
    if (this.client) {
      this.client.close();
    }
  }

  isReady(): boolean {
    return this.isConfigured;
  }
}

// Singleton instance - lazy initialization
let hederaServiceInstance: HederaService | null = null;

export function getHederaService(): HederaService {
  if (!hederaServiceInstance) {
    console.log('Creating HederaService instance...');
    hederaServiceInstance = new HederaService();
  }
  return hederaServiceInstance;
}

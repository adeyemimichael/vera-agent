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
  private client: Client;
  private operatorId: AccountId;
  private operatorKey: PrivateKey;
  private topicId: string | null = null;

  constructor() {
    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY;

    if (!accountId || !privateKey) {
      throw new Error('Hedera credentials not configured');
    }

    this.operatorId = AccountId.fromString(accountId);
    this.operatorKey = PrivateKey.fromString(privateKey);

    // Initialize client for testnet
    this.client = Client.forTestnet();
    this.client.setOperator(this.operatorId, this.operatorKey);
  }

  async createTopic(): Promise<string> {
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
    } catch (error) {
      logger.error('[Hedera] Failed to create topic:', error);
      throw error;
    }
  }

  async submitMessage(message: SignedMessage): Promise<string> {
    try {
      if (!this.topicId) {
        await this.createTopic();
      }

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
    this.client.close();
  }
}

export const hederaService = new HederaService();

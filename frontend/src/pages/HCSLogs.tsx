import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, ExternalLink, Hash, Clock } from 'lucide-react';
import { api, NegotiationSession } from '../lib/api';
import { formatTimestamp } from '../lib/utils';

export default function HCSLogs() {
  const [sessions, setSessions] = useState<NegotiationSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getNegotiations();
      setSessions(data.filter(s => s.hcsTopicId));
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">HCS Logs</h1>
        <p className="text-muted-foreground">
          Append-only on-chain verification feed via Hedera Consensus Service
        </p>
      </div>

      {sessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 px-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50"
        >
          <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No HCS Logs Yet</h3>
          <p className="text-muted-foreground">
            Start a negotiation to see messages logged to Hedera
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {sessions.map((session, sessionIndex) => (
            <motion.div
              key={session.sessionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sessionIndex * 0.1 }}
              className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50"
            >
              {/* Topic Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-xl font-bold">HCS Topic</h3>
                  </div>
                  <p className="font-mono text-sm text-purple-600 dark:text-purple-400">
                    {session.hcsTopicId}
                  </p>
                </div>
                <a
                  href={`https://hashscan.io/testnet/topic/${session.hcsTopicId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  <span className="text-sm font-medium">View on HashScan</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Session Info */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-sm text-muted-foreground mb-1">Session ID</p>
                  <p className="font-mono text-sm">{session.sessionId.slice(0, 12)}...</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-sm text-muted-foreground mb-1">Messages</p>
                  <p className="text-2xl font-bold">{session.messages.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="text-sm font-semibold capitalize">{session.status}</p>
                </div>
              </div>

              {/* Message Log */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Logged Messages
                </h4>
                {session.messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sessionIndex * 0.1 + index * 0.05 }}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{message.type.toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">
                            {message.agentId === session.buyerAgentId ? 'Buyer' : 'Seller'} Agent
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(message.timestamp)}</span>
                      </div>
                    </div>

                    {message.hash && (
                      <div className="flex items-start space-x-2 p-3 rounded bg-white dark:bg-slate-900/50 font-mono text-xs">
                        <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 break-all">
                          <p className="text-muted-foreground mb-1">Message Hash</p>
                          <p className="text-purple-600 dark:text-purple-400">{message.hash}</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <details className="cursor-pointer">
                        <summary className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          View Message Data
                        </summary>
                        <pre className="mt-2 p-3 rounded bg-white dark:bg-slate-900/50 text-xs overflow-x-auto">
                          {JSON.stringify(message.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
      >
        <h3 className="font-semibold mb-2 flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>About HCS Logging</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          All negotiation messages are logged to Hedera Consensus Service (HCS) for immutable, 
          verifiable record-keeping. Each message receives a consensus timestamp and sequence number, 
          ensuring complete transparency and auditability of all agent interactions.
        </p>
      </motion.div>
    </div>
  );
}

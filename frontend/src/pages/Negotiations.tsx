import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { api, NegotiationSession, SignedMessage } from '../lib/api';
import { formatCurrency, formatTimestamp } from '../lib/utils';

export default function Negotiations() {
  const [sessions, setSessions] = useState<NegotiationSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<NegotiationSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getNegotiations();
      setSessions(data);
      if (selectedSession) {
        const updated = data.find(s => s.sessionId === selectedSession.sessionId);
        if (updated) setSelectedSession(updated);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'accept':
        return '✓';
      case 'reject':
        return '✗';
      case 'counter':
        return '↔';
      default:
        return '→';
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'accept':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'reject':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'counter':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
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
        <h1 className="text-4xl font-bold mb-2">Negotiations</h1>
        <p className="text-muted-foreground">
          Real-time agent negotiation sessions with signed messages
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Sessions</h2>
          {sessions.length === 0 ? (
            <div className="text-center py-12 px-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No negotiations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <motion.button
                  key={session.sessionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedSession(session)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                    selectedSession?.sessionId === session.sessionId
                      ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                      : 'bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/50 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm">{session.sessionId.slice(0, 8)}...</span>
                    {getStatusIcon(session.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{session.messages.length} messages</span>
                    <span className="text-muted-foreground">{formatTimestamp(new Date(session.startedAt))}</span>
                  </div>
                  {session.finalPrice && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(session.finalPrice)}
                      </span>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Message Viewer */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedSession ? (
              <motion.div
                key={selectedSession.sessionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50"
              >
                {/* Session Header */}
                <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Session Details</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      selectedSession.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      selectedSession.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {selectedSession.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Buyer Agent</p>
                      <p className="font-mono">{selectedSession.buyerAgentId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Seller Agent</p>
                      <p className="font-mono">{selectedSession.sellerAgentId}</p>
                    </div>
                    {selectedSession.hcsTopicId && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground mb-1">HCS Topic ID</p>
                        <p className="font-mono text-purple-600 dark:text-purple-400">{selectedSession.hcsTopicId}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {selectedSession.messages.map((message, index) => {
                    const isBuyer = message.agentId === selectedSession.buyerAgentId;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: isBuyer ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${isBuyer ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[80%] ${isBuyer ? 'items-start' : 'items-end'}`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              {isBuyer ? 'Buyer' : 'Seller'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getMessageColor(message.type)}`}>
                              {getMessageIcon(message.type)} {message.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          <div className={`p-4 rounded-xl ${
                            isBuyer
                              ? 'bg-blue-50 dark:bg-blue-900/20 rounded-tl-none'
                              : 'bg-purple-50 dark:bg-purple-900/20 rounded-tr-none'
                          }`}>
                            {message.data.productName && (
                              <p className="font-semibold mb-2">{message.data.productName}</p>
                            )}
                            {message.data.totalPrice && (
                              <p className="text-2xl font-bold mb-2">
                                {formatCurrency(message.data.totalPrice)}
                              </p>
                            )}
                            {message.data.quantity && (
                              <p className="text-sm text-muted-foreground">
                                Quantity: {message.data.quantity} units @ {formatCurrency(message.data.pricePerUnit)}/unit
                              </p>
                            )}
                            {message.data.deliveryTerms && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {message.data.deliveryTerms}
                              </p>
                            )}
                            {message.data.reason && (
                              <p className="text-sm text-red-600 dark:text-red-400">
                                Reason: {message.data.reason}
                              </p>
                            )}
                            {message.hash && (
                              <p className="text-xs font-mono text-muted-foreground mt-2 truncate">
                                Hash: {message.hash.slice(0, 16)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Final Result */}
                {selectedSession.status === 'completed' && selectedSession.finalPrice && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90 mb-1">Deal Completed</p>
                        <p className="text-3xl font-bold">{formatCurrency(selectedSession.finalPrice)}</p>
                      </div>
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full min-h-[400px] rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50"
              >
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select a session to view messages</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

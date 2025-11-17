import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Users, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';
import { api, NegotiationSession } from '../lib/api';
import { formatCurrency, formatTimestamp } from '../lib/utils';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<NegotiationSession[]>([]);
  const [stats, setStats] = useState({
    totalAgents: 2,
    activeNegotiations: 0,
    completedDeals: 0,
    totalVolume: 0
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getNegotiations();
      setSessions(data);
      
      const completed = data.filter(s => s.status === 'completed').length;
      const active = data.filter(s => s.status === 'active').length;
      const volume = data
        .filter(s => s.finalPrice)
        .reduce((sum, s) => sum + (s.finalPrice || 0), 0);

      setStats({
        totalAgents: 2,
        activeNegotiations: active,
        completedDeals: completed,
        totalVolume: volume
      });
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleStartSimulation = async () => {
    setLoading(true);
    try {
      await api.startNegotiation();
      await loadSessions();
    } catch (error) {
      console.error('Failed to start negotiation:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Agents', value: stats.totalAgents, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Negotiations', value: stats.activeNegotiations, icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
    { label: 'Completed Deals', value: stats.completedDeals, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Volume', value: formatCurrency(stats.totalVolume), icon: TrendingUp, color: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent"
        >
          Verifiable Exchange of Autonomous Resources
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Multi-agent marketplace with Hedera on-chain verification and microtransaction settlement
        </motion.p>
      </div>

      {/* Start Simulation Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <button
          onClick={handleStartSimulation}
          disabled={loading}
          className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-3">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
            )}
            <span>{loading ? 'Running Simulation...' : 'Start Simulation'}</span>
          </div>
        </button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl" 
                   style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
              <div className="relative p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 hover:border-purple-500/50 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50"
        >
          <h2 className="text-2xl font-bold mb-6">Recent Negotiations</h2>
          <div className="space-y-4">
            {sessions.slice(0, 5).map((session, index) => (
              <motion.div
                key={session.sessionId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    session.status === 'completed' ? 'bg-green-500' :
                    session.status === 'active' ? 'bg-blue-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium">{session.sessionId.slice(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimestamp(new Date(session.startedAt))}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {session.finalPrice ? formatCurrency(session.finalPrice) : '—'}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">{session.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

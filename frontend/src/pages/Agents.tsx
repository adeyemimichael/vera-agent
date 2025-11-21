import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, TrendingUp, Package, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, Agent } from '../lib/api';
import { formatAddress, formatTimestamp } from '../lib/utils';

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await api.getAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'buyer':
        return 'from-blue-500 to-cyan-500';
      case 'seller':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-green-500 to-emerald-500';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'buyer':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'seller':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Autonomous Agents</h1>
          <p className="text-muted-foreground">
            Registered agents with verified identities on Hedera
          </p>
        </div>
        <Link
          to="/agents/register"
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300"
        >
          <UserPlus className="w-5 h-5" />
          <span>Register New Agent</span>
        </Link>
      </div>

      {agents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 px-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50"
        >
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Agents Yet</h3>
          <p className="text-muted-foreground">
            Register your first agent to start trading
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.agentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                   style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
              <div className="relative p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 hover:border-purple-500/50 transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getRoleColor(agent.role)} flex items-center justify-center`}>
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.agentId}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(agent.role)}`}>
                    {agent.role.toUpperCase()}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Shield className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                    <p className="text-2xl font-bold">{agent.reputationScore}</p>
                    <p className="text-xs text-muted-foreground">Reputation</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Package className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                    <p className="text-2xl font-bold">{agent.transactionCount}</p>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-600 dark:text-green-400" />
                    <p className="text-2xl font-bold">{agent.status === 'active' ? '✓' : '✗'}</p>
                    <p className="text-xs text-muted-foreground">Status</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner</span>
                    <span className="font-mono">{formatAddress(agent.owner)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Public Key</span>
                    <span className="font-mono">{agent.publicKey.slice(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registered</span>
                    <span>{formatTimestamp(new Date(agent.registeredAt))}</span>
                  </div>
                  {agent.metadataCID && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Metadata CID</span>
                      <span className="font-mono">{agent.metadataCID.slice(0, 12)}...</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

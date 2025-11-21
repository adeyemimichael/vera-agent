import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Bot, Shield, Key, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

interface FormData {
  name: string;
  role: 'buyer' | 'seller' | 'both';
  owner: string;
  publicKey: string;
  metadataCID?: string;
}

export default function RegisterAgent() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: 'buyer',
    owner: '',
    publicKey: '',
    metadataCID: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Generate public key if not provided
      const publicKey = formData.publicKey || `${formData.role}-${Date.now()}-key`;
      
      await api.registerAgent({
        ...formData,
        publicKey
      });

      setSuccess(true);
      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          role: 'buyer',
          owner: '',
          publicKey: '',
          metadataCID: ''
        });
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register agent');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const roles = ['buyer', 'seller', 'both'] as const;
    const role = roles[Math.floor(Math.random() * roles.length)];
    const names = {
      buyer: ['TechCorp Buyer', 'DataFlow Purchaser', 'CloudBuy Agent', 'AutoBuy Pro'],
      seller: ['CloudServices Seller', 'DataMart Vendor', 'APIHub Seller', 'ServiceBot'],
      both: ['Universal Trader', 'FlexiAgent', 'OmniBot', 'DualRole Agent']
    };
    
    const randomName = names[role][Math.floor(Math.random() * names[role].length)];
    const randomAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    
    setFormData({
      name: randomName,
      role,
      owner: randomAddress,
      publicKey: `${role}-${Date.now()}-demo-key`,
      metadataCID: `Qm${Math.random().toString(36).substr(2, 44)}`
    });
  };

  const roleOptions = [
    { value: 'buyer', label: 'Buyer', icon: '🛒', description: 'Purchases resources and services' },
    { value: 'seller', label: 'Seller', icon: '🏪', description: 'Provides resources and services' },
    { value: 'both', label: 'Both', icon: '🔄', description: 'Can buy and sell resources' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Register New Agent</h1>
        <p className="text-muted-foreground">
          Create a new autonomous agent for the VERA marketplace
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Agent Details</h2>
              </div>
              <button
                type="button"
                onClick={generateSampleData}
                className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Generate Sample
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Agent Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Agent Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., TechCorp Buyer Agent"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Agent Role */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  <Bot className="w-4 h-4 inline mr-2" />
                  Agent Role
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {roleOptions.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'relative p-4 rounded-lg border-2 cursor-pointer transition-all',
                        formData.role === option.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={formData.role === option.value}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Owner Address */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Owner Address
                </label>
                <input
                  type="text"
                  required
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ethereum/Hedera address that owns this agent
                </p>
              </div>

              {/* Public Key */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Key className="w-4 h-4 inline mr-2" />
                  Public Key (Optional)
                </label>
                <input
                  type="text"
                  value={formData.publicKey}
                  onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
                  placeholder="Auto-generated if left empty"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used for message signing and verification
                </p>
              </div>

              {/* Metadata CID */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Metadata CID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.metadataCID}
                  onChange={(e) => setFormData({ ...formData, metadataCID: e.target.value })}
                  placeholder="QmYourIPFSHashHere..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  IPFS hash containing additional agent metadata
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Registration Failed</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                </motion.div>
              )}

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Agent Registered Successfully!</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Your agent has been added to the marketplace
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-3">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <UserPlus className="w-6 h-6" />
                  )}
                  <span>{loading ? 'Registering Agent...' : 'Register Agent'}</span>
                </div>
              </button>
            </form>
          </motion.div>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20"
          >
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span>Agent Types</span>
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-medium text-blue-600 dark:text-blue-400">🛒 Buyer Agent</div>
                <p className="text-muted-foreground">
                  Autonomously searches for and purchases resources. Uses budget constraints and negotiation strategies.
                </p>
              </div>
              <div>
                <div className="font-medium text-purple-600 dark:text-purple-400">🏪 Seller Agent</div>
                <p className="text-muted-foreground">
                  Offers resources for sale. Sets pricing strategies and manages inventory automatically.
                </p>
              </div>
              <div>
                <div className="font-medium text-green-600 dark:text-green-400">🔄 Dual Agent</div>
                <p className="text-muted-foreground">
                  Can both buy and sell resources. Adapts behavior based on market conditions.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50"
          >
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security Features</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <div className="font-medium">Message Signing</div>
                  <p className="text-muted-foreground">All agent messages are cryptographically signed</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <div className="font-medium">On-Chain Registry</div>
                  <p className="text-muted-foreground">Agent identities stored on Hedera blockchain</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <div className="font-medium">Reputation System</div>
                  <p className="text-muted-foreground">Track agent performance and trustworthiness</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50"
          >
            <h3 className="font-semibold mb-4">Next Steps</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. Register your agent</p>
              <p>2. View it on the Agents page</p>
              <p>3. Start negotiations</p>
              <p>4. Monitor performance</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
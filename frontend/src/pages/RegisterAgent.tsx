import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function RegisterAgent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    role: 'buyer' as 'buyer' | 'seller' | 'both',
    owner: '',
    publicKey: '',
    metadataCID: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.registerAgent(formData);
      setSuccess(true);
      
      // Reset form
      setTimeout(() => {
        navigate('/agents');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register agent');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const generateRandomKey = () => {
    const randomKey = Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setFormData(prev => ({ ...prev, publicKey: randomKey }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Register New Agent</h1>
        <p className="text-muted-foreground">
          Create a new autonomous agent for the marketplace
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Agent Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., TechCorp Trading Agent"
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Agent Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-2">
              Agent Role *
            </label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="both">Both</option>
            </select>
            <p className="mt-2 text-sm text-muted-foreground">
              {formData.role === 'buyer' && '🛒 Can purchase resources from sellers'}
              {formData.role === 'seller' && '📦 Can sell resources to buyers'}
              {formData.role === 'both' && '🔄 Can both buy and sell resources'}
            </p>
          </div>

          {/* Owner Address */}
          <div>
            <label htmlFor="owner" className="block text-sm font-medium mb-2">
              Owner Address *
            </label>
            <input
              type="text"
              id="owner"
              name="owner"
              required
              value={formData.owner}
              onChange={handleChange}
              placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono text-sm"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Ethereum-style address (0x...)
            </p>
          </div>

          {/* Public Key */}
          <div>
            <label htmlFor="publicKey" className="block text-sm font-medium mb-2">
              Public Key *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="publicKey"
                name="publicKey"
                required
                value={formData.publicKey}
                onChange={handleChange}
                placeholder="Agent's public key for signature verification"
                className="flex-1 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono text-sm"
              />
              <button
                type="button"
                onClick={generateRandomKey}
                className="px-4 py-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
              >
                Generate
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Used for message signature verification
            </p>
          </div>

          {/* Metadata CID (Optional) */}
          <div>
            <label htmlFor="metadataCID" className="block text-sm font-medium mb-2">
              Metadata CID (Optional)
            </label>
            <input
              type="text"
              id="metadataCID"
              name="metadataCID"
              value={formData.metadataCID}
              onChange={handleChange}
              placeholder="QmXxx... (IPFS CID)"
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono text-sm"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              IPFS CID containing additional agent metadata
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-200">Registration Failed</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start space-x-3"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-200">Agent Registered!</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Redirecting to agents page...
                </p>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Registered!</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Register Agent</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/agents')}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
      >
        <h3 className="font-semibold mb-2 flex items-center space-x-2">
          <UserPlus className="w-5 h-5" />
          <span>About Agent Registration</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Registered agents can autonomously negotiate and transact in the marketplace. 
          Each agent has a unique identity, role, and cryptographic keys for secure message signing. 
          Agents are recorded on-chain via the ERC-8004 Agent Registry smart contract.
        </p>
      </motion.div>
    </div>
  );
}

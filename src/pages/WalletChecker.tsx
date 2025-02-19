import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { checkRateLimit } from '../lib/rateLimit';
import { validateSuiAddress } from '../utils/validation';

interface WalletStatus {
  isOG: boolean;
  isWL: boolean;
  ogMintsAllowed?: number;
  ogMintsUsed?: number;
  wlMintsAllowed?: number;
  wlMintsUsed?: number;
}

export default function WalletChecker() {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<WalletStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkRateLimit('user-ip')) {
      toast.error('Rate limit exceeded. Please try again later.');
      return;
    }

    if (!address) {
      toast.error('Please enter a wallet address');
      return;
    }

    if (!validateSuiAddress(address)) {
      toast.error('Please enter a valid Sui wallet address (format: 0x...)');
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const [{ data: ogData }, { data: wlData }] = await Promise.all([
        supabase
          .from('og_wallets')
          .select('mints_allowed, mints_used')
          .eq('wallet_address', address),
        supabase
          .from('wl_wallets')
          .select('mints_allowed, mints_used')
          .eq('wallet_address', address)
      ]);

      const status: WalletStatus = {
        isOG: Boolean(ogData?.length),
        isWL: Boolean(wlData?.length),
        ...(ogData?.[0] && {
          ogMintsAllowed: ogData[0].mints_allowed,
          ogMintsUsed: ogData[0].mints_used
        }),
        ...(wlData?.[0] && {
          wlMintsAllowed: wlData[0].mints_allowed,
          wlMintsUsed: wlData[0].mints_used
        })
      };

      setStatus(status);
    } catch (error) {
      console.error('Error checking wallet:', error);
      toast.error('Failed to check wallet status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
        <h1 className="text-4xl font-bold text-white mb-6">Haru NFT</h1>
        <p className="text-gray-300 mb-8">Check your wallet's eligibility status for the upcoming mint.</p>
        
        <form onSubmit={checkWallet} className="space-y-4">
          <div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Sui wallet address..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              'Checking...'
            ) : (
              <span className="flex items-center justify-center">
                <Search className="w-5 h-5 mr-2" />
                Check Status
              </span>
            )}
          </button>
        </form>

        {status && (
          <div className="mt-8 space-y-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-4">Wallet Status</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300">OG Status:</span>
                    <span className={`font-medium ${status.isOG ? 'text-green-400' : 'text-red-400'}`}>
                      {status.isOG ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </div>
                  {status.isOG && (
                    <div className="text-sm text-gray-400 bg-white/5 rounded p-2">
                      Mints: {status.ogMintsUsed} / {status.ogMintsAllowed}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300">Whitelist Status:</span>
                    <span className={`font-medium ${status.isWL ? 'text-green-400' : 'text-red-400'}`}>
                      {status.isWL ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </div>
                  {status.isWL && (
                    <div className="text-sm text-gray-400 bg-white/5 rounded p-2">
                      Mints: {status.wlMintsUsed} / {status.wlMintsAllowed}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
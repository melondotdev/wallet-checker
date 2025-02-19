import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Search, Download, Edit2, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useRequireAuth } from '../lib/auth';
import toast from 'react-hot-toast';
import { validateSuiAddresses } from '../utils/validation';

interface Wallet {
  wallet_address: string;
  mints_allowed: number;
  mints_used: number;
}

interface EditingWallet {
  address: string;
  type: 'OG' | 'WL';
  mints: number;
}

export default function Admin() {
  const { user, loading } = useRequireAuth();
  const [ogWallets, setOgWallets] = useState<Wallet[]>([]);
  const [wlWallets, setWlWallets] = useState<Wallet[]>([]);
  const [newAddresses, setNewAddresses] = useState('');
  const [addingTo, setAddingTo] = useState<'OG' | 'WL'>('OG');
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingWallet, setEditingWallet] = useState<EditingWallet | null>(null);

  useEffect(() => {
    const fetchWallets = async () => {
      const [{ data: ogData }, { data: wlData }] = await Promise.all([
        supabase.from('og_wallets').select('*').order('created_at', { ascending: false }),
        supabase.from('wl_wallets').select('*').order('created_at', { ascending: false })
      ]);

      if (ogData) setOgWallets(ogData);
      if (wlData) setWlWallets(wlData);
    };

    fetchWallets();
  }, [refreshKey]);

  const addWallets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddresses.trim()) {
      toast.error('Please enter at least one wallet address');
      return;
    }

    const addresses = newAddresses
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0);

    if (addresses.length === 0) {
      toast.error('No valid addresses found');
      return;
    }

    const { valid, invalid } = validateSuiAddresses(addresses);

    if (invalid.length > 0) {
      toast.error(
        <div>
          <p>Invalid Sui addresses found:</p>
          <ul className="mt-2 list-disc list-inside">
            {invalid.map((addr, i) => (
              <li key={i} className="text-sm break-all">{addr}</li>
            ))}
          </ul>
        </div>
      );
      return;
    }

    try {
      const { error } = await supabase
        .from(addingTo === 'OG' ? 'og_wallets' : 'wl_wallets')
        .insert(
          valid.map(address => ({
            wallet_address: address,
            mints_allowed: addingTo === 'OG' ? 1 : 3,
            mints_used: 0
          }))
        );

      if (error) throw error;

      toast.success(`Added ${valid.length} addresses to ${addingTo} list`);
      setNewAddresses('');
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error adding wallets:', error);
      toast.error('Failed to add wallets');
    }
  };

  const removeWallet = async (address: string, type: 'OG' | 'WL') => {
    try {
      const { error } = await supabase
        .from(type === 'OG' ? 'og_wallets' : 'wl_wallets')
        .delete()
        .eq('wallet_address', address);

      if (error) throw error;

      toast.success(`Wallet removed from ${type} list`);
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error removing wallet:', error);
      toast.error('Failed to remove wallet');
    }
  };

  const startEditing = (address: string, type: 'OG' | 'WL', currentMints: number) => {
    setEditingWallet({ address, type, mints: currentMints });
  };

  const cancelEditing = () => {
    setEditingWallet(null);
  };

  const saveMintsAllowed = async () => {
    if (!editingWallet) return;

    try {
      const { error } = await supabase
        .from(editingWallet.type === 'OG' ? 'og_wallets' : 'wl_wallets')
        .update({ mints_allowed: editingWallet.mints })
        .eq('wallet_address', editingWallet.address);

      if (error) throw error;

      toast.success('Updated mints allowed successfully');
      setEditingWallet(null);
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error updating mints allowed:', error);
      toast.error('Failed to update mints allowed');
    }
  };

  const exportToCSV = (wallets: Wallet[], type: string) => {
    const headers = ['Wallet Address', 'Mints Allowed', 'Mints Used'];
    const csvContent = [
      headers.join(','),
      ...wallets.map(wallet => 
        [wallet.wallet_address, wallet.mints_allowed, wallet.mints_used].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type.toLowerCase()}-wallets.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOgWallets = ogWallets.filter(wallet => 
    wallet.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWlWallets = wlWallets.filter(wallet => 
    wallet.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const renderWalletItem = (wallet: Wallet, type: 'OG' | 'WL') => {
    const isEditing = editingWallet?.address === wallet.wallet_address;

    return (
      <div
        key={wallet.wallet_address}
        className="flex items-center justify-between bg-white/10 p-3 rounded-lg"
      >
        <div className="flex-1 min-w-0 mr-4">
          <div className="text-white font-medium break-all">{wallet.wallet_address}</div>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <span>Mints: {wallet.mints_used} /</span>
            {isEditing ? (
              <input
                type="number"
                min="1"
                max="100"
                value={editingWallet.mints}
                onChange={(e) => setEditingWallet({ ...editingWallet, mints: parseInt(e.target.value) || 1 })}
                className="w-16 bg-white/20 rounded px-2 py-1 text-white"
              />
            ) : (
              <span>{wallet.mints_allowed}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={saveMintsAllowed}
                className="text-green-400 hover:text-green-300 transition-colors"
                title="Save"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={cancelEditing}
                className="text-gray-400 hover:text-gray-300 transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEditing(wallet.wallet_address, type, wallet.mints_allowed)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="Edit mints allowed"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => removeWallet(wallet.wallet_address, type)}
                className="text-red-400 hover:text-red-300 transition-colors"
                title="Remove wallet"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        <Link 
          to="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-black/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
          
          <form onSubmit={addWallets} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <textarea
                  value={newAddresses}
                  onChange={(e) => setNewAddresses(e.target.value)}
                  placeholder="Enter Sui wallet addresses (one per line, format: 0x...)"
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="mt-2 text-sm text-gray-400 break-all">
                  Example: 0x02a212de6a9dfa3a69e22387acfbafbb1a9e591bd9d636e7895dcfc8de05f331
                </p>
              </div>
              <div className="space-y-4">
                <select
                  value={addingTo}
                  onChange={(e) => setAddingTo(e.target.value as 'OG' | 'WL')}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="OG">OG List</option>
                  <option value="WL">Whitelist</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Wallets
                </button>
              </div>
            </div>
          </form>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search wallets..."
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">OG List</h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">{filteredOgWallets.length} wallets</span>
                  <button
                    onClick={() => exportToCSV(ogWallets, 'OG')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                    title="Export as CSV"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Export</span>
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredOgWallets.map(wallet => renderWalletItem(wallet, 'OG'))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Whitelist</h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">{filteredWlWallets.length} wallets</span>
                  <button
                    onClick={() => exportToCSV(wlWallets, 'WL')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                    title="Export as CSV"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Export</span>
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredWlWallets.map(wallet => renderWalletItem(wallet, 'WL'))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
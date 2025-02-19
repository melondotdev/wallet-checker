import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 text-center">
        <h1 className="text-4xl font-bold text-white mb-6">Haru Wallet Checker</h1>
        <Link 
          to="/check-wallet"
          className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-lg hover:opacity-90 transition-opacity mb-4"
        >
          <Search className="w-5 h-5" />
          <span>Check Wallet Status</span>
        </Link>
        <Link 
          to="/admin"
          className="text-gray-400 hover:text-white transition-colors"
        >
          Admin Panel
        </Link>
      </div>
    </div>
  );
}
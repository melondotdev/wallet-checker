import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WalletChecker from './pages/WalletChecker';
import Admin from './pages/Admin';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WalletChecker />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
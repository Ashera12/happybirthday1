import { useState } from 'react';
import { motion } from 'framer-motion';

export default function UsernameInput({ onSubmit }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Masukkan nama dulu ya!');
      return;
    }
    
    // Validate username format (alphanumeric, hyphen, underscore)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('Nama hanya boleh huruf, angka, strip (-) dan underscore (_)');
      return;
    }
    
    onSubmit(username.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <span className="text-6xl">🎂</span>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Buat Kartu Ucapan
          </h1>
          <p className="text-slate-600 mb-8">
            Masukkan nama untuk link kartu custom-mu
          </p>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
                placeholder="Contoh: nabila, amelia-18, budi-2024"
                className="w-full px-4 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none text-center text-lg"
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition active:scale-95"
            >
              Lanjutkan →
            </button>
          </div>

          <div className="mt-6 text-sm text-slate-500">
            <p>Link akan jadi: <span className="font-mono text-pink-600">/{username || 'nama-kamu'}</span></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function ViewCard({ username, onBack }) {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const loadCard = async () => {
      setLoading(true);
      setError('');

      try {
        let data = null;

        // Try Supabase first if configured
        if (supabase) {
          const { data: dbData, error: dbError } = await supabase
            .from('birthday_cards')
            .select('*')
            .eq('username', username.toLowerCase())
            .single();

          if (!dbError && dbData) {
            data = dbData;
          }
        }

        // Fallback to localStorage
        if (!data) {
          const localCards = JSON.parse(localStorage.getItem('birthday_cards') || '{}');
          data = localCards[username.toLowerCase()];
        }

        if (data) {
          setCardData(data);
          // Trigger confetti after a delay
          setTimeout(() => setShowConfetti(true), 500);
        } else {
          setError('Kartu tidak ditemukan. Mungkin linknya salah atau kartu sudah dihapus.');
        }
      } catch (err) {
        console.error('Error loading card:', err);
        setError('Terjadi kesalahan saat memuat kartu.');
      } finally {
        setLoading(false);
      }
    };

    loadCard();
  }, [username]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Kartu Ucapan untuk ${cardData?.recipient}`,
          text: `Lihat kartu ucapan spesial untuk ${cardData?.recipient}! 🎉`,
          url: url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Link sudah disalin ke clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat kartu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-2xl transition-colors"
          >
            Buat Kartu Baru
          </button>
        </div>
      </div>
    );
  }

  if (!cardData) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: -20, 
                x: Math.random() * window.innerWidth,
                rotate: 0,
                opacity: 1 
              }}
              animate={{ 
                y: window.innerHeight + 20,
                rotate: 360,
                opacity: 0 
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute text-2xl"
            >
              {['🎉', '🎊', '🎈', '✨', '🎁', '🎂', '🌟'][Math.floor(Math.random() * 7)]}
            </motion.div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <span>←</span> Buat Kartu Lain
        </button>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        >
          {/* Card Frame */}
          <div className="bg-gradient-to-br from-pink-400 via-purple-400 via-blue-400 to-indigo-400 p-[3px]">
            <div className="bg-white rounded-[calc(2rem-3px)] overflow-hidden">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium"
                >
                  <span className="animate-bounce">🎉</span>
                  Happy Birthday
                  <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎂</span>
                </motion.div>
              </div>

              {/* Recipient Name */}
              <div className="px-6 pt-8 pb-4 text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                >
                  {cardData.recipient}
                </motion.h1>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6 }}
                  className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto mt-4 rounded-full"
                />
              </div>

              {/* Photo Section */}
              {cardData.photo_url ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="px-6 mb-6"
                >
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={cardData.photo_url} 
                      alt={cardData.recipient}
                      className="w-full h-64 md:h-80 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="hidden w-full h-64 md:h-80 bg-gradient-to-br from-pink-100 to-purple-100 items-center justify-center"
                    >
                      <span className="text-6xl">🎂</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="px-6 mb-6"
                >
                  <div className="rounded-2xl h-48 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
                    <span className="text-8xl animate-pulse">🎂</span>
                  </div>
                </motion.div>
              )}

              {/* Message Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="px-6 pb-8"
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                  <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line text-center">
                    {cardData.message}
                  </p>
                </div>
              </motion.div>

              {/* Sender */}
              {cardData.sender && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="px-6 pb-8 text-center"
                >
                  <div className="inline-flex flex-col items-center">
                    <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-slate-400 to-transparent mb-4"></div>
                    <p className="text-sm text-slate-500 mb-1">Dengan cinta,</p>
                    <p className="text-lg font-semibold text-slate-800">{cardData.sender}</p>
                  </div>
                </motion.div>
              )}

              {/* Footer Decoration */}
              <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-4">
                <div className="flex justify-center gap-2">
                  {['✨', '🎈', '🎊', '🎁', '🌟'].map((emoji, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="text-xl"
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-6 grid grid-cols-2 gap-4"
        >
          <button
            onClick={handleShare}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <span>📤</span> Share Link
          </button>
          <button
            onClick={onBack}
            className="bg-white hover:bg-gray-50 text-slate-700 font-bold py-4 rounded-2xl transition-all border-2 border-gray-200"
          >
            Buat Kartu Baru
          </button>
        </motion.div>

        {/* URL Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-4 text-center"
        >
          <p className="text-sm text-slate-500">
            Link kartu ini: <span className="font-mono text-pink-600">{window.location.origin}/{username}</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

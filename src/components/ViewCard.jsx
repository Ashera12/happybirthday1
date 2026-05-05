import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function ViewCard({ username, onBack, onEdit }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadCard = async () => {
      setLoading(true);
      
      // Try localStorage first
      const localData = localStorage.getItem(`birthday-card-${username}`);
      if (localData) {
        try {
          setCard(JSON.parse(localData));
          setLoading(false);
          return;
        } catch (e) {
          console.log('Error parsing local card');
        }
      }
      
      // Try Supabase
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('birthday_cards')
            .select('*')
            .eq('username', username)
            .single();
          
          if (data) {
            setCard(data);
            // Save to localStorage for backup
            localStorage.setItem(`birthday-card-${username}`, JSON.stringify(data));
          } else {
            setNotFound(true);
          }
        } catch (err) {
          console.log('Supabase error:', err);
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
      
      setLoading(false);
    };
    
    loadCard();
  }, [username]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Kartu Ucapan untuk ${card?.recipient || username}`,
          text: 'Lihat kartu ucapan spesial ini!',
          url
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Link disalin ke clipboard!');
      } catch (err) {
        console.log('Copy failed');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Memuat kartu...</p>
        </div>
      </div>
    );
  }

  if (notFound || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Kartu Belum Ada</h2>
          <p className="text-slate-600 mb-6">
            Kartu untuk "{username}" belum dibuat. Yuk buat dulu!
          </p>
          <div className="space-y-3">
            <button
              onClick={onBack}
              className="w-full bg-pink-500 text-white font-bold py-3 rounded-2xl hover:bg-pink-600 transition"
            >
              Buat Kartu Baru
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-800"
        >
          <span>←</span> Buat Kartu Lain
        </button>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm">
              <span>🎉</span> Happy Birthday <span>🎂</span>
            </div>
          </div>

          {/* Recipient */}
          <div className="px-6 pt-8 pb-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {card?.recipient}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto mt-4 rounded-full" />
          </div>

          {/* Photo */}
          {card?.image_url ? (
            <div className="px-6 mb-6">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={card?.image_url} 
                  alt={card?.recipient}
                  className="w-full h-64 md:h-80 object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          ) : (
            <div className="px-6 mb-6">
              <div className="rounded-2xl h-48 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
                <span className="text-8xl">🎂</span>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="px-6 pb-8">
            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line text-center">
                {card.message}
              </p>
            </div>
          </div>

          {/* Sender */}
          {card.sender && (
            <div className="px-6 pb-8 text-center">
              <div className="inline-flex flex-col items-center">
                <div className="w-16 h-[1px] bg-slate-300 mb-4" />
                <p className="text-sm text-slate-500 mb-1">Dengan cinta,</p>
                <p className="text-lg font-semibold text-slate-800">{card.sender}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-4">
            <div className="flex justify-center gap-2">
              {['✨', '🎈', '🎊', '🎁', '🌟'].map((emoji, i) => (
                <span key={i} className="text-xl">{emoji}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={handleShare}
            className="bg-green-500 text-white font-bold py-4 rounded-2xl hover:bg-green-600 transition"
          >
            📤 Share
          </button>
          <button
            onClick={onEdit}
            className="bg-white text-slate-700 font-bold py-4 rounded-2xl border-2 border-gray-200 hover:bg-gray-50 transition"
          >
            ✏️ Edit
          </button>
        </div>

        {/* URL Display */}
        <p className="mt-4 text-center text-sm text-slate-500">
          Link: <span className="font-mono text-pink-600">{window.location.origin}/{username}</span>
        </p>
      </div>
    </div>
  );
}

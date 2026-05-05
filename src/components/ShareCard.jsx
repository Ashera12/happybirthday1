import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import CardEditor from './CardEditor';

export default function ShareCard({ username, onClose }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true);
      setError('');
      
      // For demo purposes, work without Supabase
      if (!supabase) {
        console.log('Supabase not configured - working in demo mode');
        // Try to load from localStorage
        try {
          const savedCard = localStorage.getItem(`birthday-card-${username}`);
          if (savedCard) {
            setCard(JSON.parse(savedCard));
          } else {
            setCard(null); // No existing card
          }
        } catch (err) {
          console.log('No saved card found in localStorage');
          setCard(null);
        }
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('birthday_cards')
          .select('*')
          .eq('username', username)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        setCard(data);
      } catch (err) {
        console.error('Share card fetch error:', err);
        // Don't set error for missing cards - that's expected for new cards
        if (err?.code !== 'PGRST116') {
          setError(err?.message || 'Terjadi kesalahan saat memuat data.');
        } else {
          setCard(null); // Card doesn't exist yet
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchCard();
    }
  }, [username]);

  const handleCreateCard = () => {
    setShowEditor(true);
  };

  const handleSaveCard = async (cardData) => {
    setSaving(true);
    
    // Demo mode - save to localStorage
    if (!supabase) {
      try {
        // Save image as data URL (already is)
        const cardToSave = {
          username,
          recipient: cardData.recipient,
          sender: cardData.sender,
          message: cardData.message,
          image_url: cardData.imageUrl,
          image_position: cardData.imagePosition,
          text_position: cardData.textPosition,
          image_scale: cardData.imageScale,
          text_size: cardData.textSize,
          updated_at: new Date().toISOString()
        };

        // Save to localStorage for demo
        localStorage.setItem(`birthday-card-${username}`, JSON.stringify(cardToSave));
        
        setCard(cardToSave);
        setShowEditor(false);
        setShareUrl(`${window.location.origin}/${username}`);
        
        // Show success message
        alert('Kartu berhasil disimpan (demo mode)!');
      } catch (err) {
        console.error('Demo save error:', err);
        setError('Gagal menyimpan kartu di demo mode.');
      } finally {
        setSaving(false);
      }
      return;
    }

    // Production mode with Supabase
    try {
      let imageUrl = null;

      // Upload image if it's a data URL
      if (cardData.imageUrl && cardData.imageUrl.startsWith('data:')) {
        const base64Data = cardData.imageUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        const filename = `${username}-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('birthday-cards')
          .upload(filename, blob, { cacheControl: '3600', upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from('birthday-cards').getPublicUrl(filename);
        imageUrl = data.publicUrl;
      } else {
        imageUrl = cardData.imageUrl;
      }

      const cardToSave = {
        username,
        recipient: cardData.recipient,
        sender: cardData.sender,
        message: cardData.message,
        image_url: imageUrl,
        image_position: cardData.imagePosition,
        text_position: cardData.textPosition,
        image_scale: cardData.imageScale,
        text_size: cardData.textSize,
        updated_at: new Date().toISOString()
      };

      let result;
      if (card) {
        // Update existing card
        const { error: updateError } = await supabase
          .from('birthday_cards')
          .update(cardToSave)
          .eq('username', username);

        if (updateError) throw updateError;
        result = { ...card, ...cardToSave };
      } else {
        // Create new card
        const { data: insertData, error: insertError } = await supabase
          .from('birthday_cards')
          .insert([cardToSave])
          .select();

        if (insertError) throw insertError;
        result = insertData[0];
      }

      setCard(result);
      setShowEditor(false);
      setShareUrl(`${window.location.origin}/${username}`);
    } catch (err) {
      console.error('Save card error:', err);
      setError(err?.message || 'Gagal menyimpan kartu. Pastikan koneksi internet stabil.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || `${window.location.origin}/${username}`);
      alert('Link berhasil disalin!');
    } catch {
      setError('Gagal menyalin link, silakan salin manual.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-violet-50">
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-300 border-t-transparent" />
          </div>
          <p className="text-slate-600">Memuat kartu ucapan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-violet-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🎁</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Kartu untuk @{username}
          </h2>
          <p className="text-gray-600 mb-6">
            {error.includes('tidak ditemukan') 
              ? `Belum ada kartu ucapan untuk @${username}. Buat kartu pertama sekarang!`
              : error
            }
          </p>
          <div className="space-y-3">
            <button
              onClick={handleCreateCard}
              className="w-full bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition"
            >
              {card ? 'Edit Kartu' : 'Buat Kartu Baru'}
            </button>
            <button
              onClick={onClose}
              className="w-full border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-violet-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎉 Kartu Ucapan untuk @{username}
          </h1>
          <p className="text-gray-600">
            {card?.recipient || 'Sahabat Spesial'}
          </p>
        </div>

        {/* Card Display */}
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-br from-white via-pink-50 to-violet-50 rounded-[2rem] p-8 shadow-xl border border-pink-200">
            {/* Image */}
            {card?.image_url && (
              <div
                className="absolute"
                style={{
                  left: `${card.image_position?.x || 50}%`,
                  top: `${card.image_position?.y || 20}%`,
                  transform: `translate(-50%, -50%) scale(${card.image_scale || 1})`
                }}
              >
                <img 
                  src={card.image_url} 
                  alt="Card image" 
                  className="w-32 h-32 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Text */}
            <div
              className="absolute max-w-[80%] text-center"
              style={{
                left: `${card.text_position?.x || 50}%`,
                top: `${card.text_position?.y || 70}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <p className={`${card.text_size || 'text-lg'} font-semibold text-gray-800 whitespace-pre-line`}>
                {card.message || 'Tulis pesanmu di sini...'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Dari: {card.sender || 'Namamu'}
              </p>
            </div>

            {/* Recipient Name */}
            <div className="absolute top-4 left-4">
              <p className="text-sm text-pink-600 font-medium">
                Untuk: {card.recipient || 'Nama Penerima'}
              </p>
            </div>

            {/* Card Size Indicator */}
            <div className="relative h-96">
              {/* This div ensures the card has proper height */}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-4">
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCreateCard}
                className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition"
              >
                Edit Kartu
              </button>
              <button
                onClick={handleCopyLink}
                className="bg-violet-500 text-white px-6 py-3 rounded-lg hover:bg-violet-600 transition"
              >
                Salin Link
              </button>
              <button
                onClick={() => navigator.share?.({ 
                  title: `Kartu Ucapan untuk ${card.recipient}`, 
                  text: card.message?.slice(0, 100), 
                  url: `${window.location.origin}/${username}` 
                })}
                className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                Share
              </button>
            </div>
            
            <div className="text-center">
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Kembali ke Halaman Utama
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <CardEditor
          card={card}
          onSave={handleSaveCard}
          onClose={() => setShowEditor(false)}
        />
      )}

      {/* Loading Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="mx-auto w-12 h-12 border-4 border-pink-300 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Menyimpan kartu...</p>
          </div>
        </div>
      )}
    </div>
  );
}

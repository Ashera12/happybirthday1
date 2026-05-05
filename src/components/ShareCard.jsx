import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CardEditor from './CardEditor';
import { supabase } from '../lib/supabaseClient';

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
      
      console.log('🔍 Loading card for username:', username);
      
      // Always try localStorage first as guaranteed fallback
      const savedCard = localStorage.getItem(`birthday-card-${username}`);
      if (savedCard) {
        try {
          const parsedCard = JSON.parse(savedCard);
          console.log('✅ Found card in localStorage:', parsedCard);
          setCard(parsedCard);
          setLoading(false);
          return;
        } catch (parseError) {
          console.log('❌ Error parsing localStorage card:', parseError);
          localStorage.removeItem(`birthday-card-${username}`);
        }
      }
      
      // Try Supabase if available
      if (supabase) {
        try {
          console.log('🔍 Trying Supabase...');
          const { data, error } = await supabase
            .from('birthday_cards')
            .select('*')
            .eq('username', username)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.log('❌ Supabase error:', error);
            if (error.message?.includes('column') || error.message?.includes('does not exist')) {
              console.log('🚨 Table structure mismatch - using localStorage only');
              setError('Database structure mismatch. Using local storage.');
            } else {
              console.log('⚠️ Other Supabase error:', error.message);
            }
          } else if (error.code === 'PGRST116') {
            console.log('ℹ️ No card found in Supabase (normal for new cards)');
          }
        } else if (data) {
          console.log('✅ Found card in Supabase:', data);
          setCard(data);
          // Also save to localStorage as backup
          localStorage.setItem(`birthday-card-${username}`, JSON.stringify(data));
        }
      } else {
        console.log('ℹ️ Supabase not configured, using localStorage only');
      }
      
      setLoading(false);
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
    
    try {
      console.log('Saving card for:', username);
      
      // Prepare card data
      const cardToSave = {
        username,
        recipient: cardData.recipient || '',
        sender: cardData.sender || '',
        message: cardData.message || '',
        image_url: cardData.imageUrl || '',
        image_position: cardData.imagePosition || { x: 50, y: 20 },
        text_position: cardData.textPosition || { x: 50, y: 70 },
        image_scale: cardData.imageScale || 1.0,
        text_size: cardData.textSize || 'text-lg',
        theme_color: cardData.themeColor || 'pink',
        updated_at: new Date().toISOString()
      };

      let savedCard = null;
      let useSupabase = false;

      // Try Supabase first if available
      if (supabase) {
        try {
          console.log('Saving to Supabase...');
          
          // Handle image upload if needed
          let imageUrl = cardData.imageUrl;
          if (cardData.imageUrl && cardData.imageUrl.startsWith('data:')) {
            // Convert data URL to blob and upload
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
            cardToSave.image_url = imageUrl;
          }

          // Save to database
          const { data, error } = card 
            ? await supabase.from('birthday_cards').update(cardToSave).eq('username', username).select()
            : await supabase.from('birthday_cards').insert([cardToSave]).select();

          if (error) throw error;
          
          savedCard = data[0];
          useSupabase = true;
          console.log('Saved to Supabase:', savedCard);
          
        } catch (supabaseError) {
          console.log('Supabase save failed, using localStorage:', supabaseError);
          useSupabase = false;
        }
      }

      // Always save to localStorage as backup
      localStorage.setItem(`birthday-card-${username}`, JSON.stringify(cardToSave));
      
      // Use Supabase data if available, otherwise use local data
      const finalCard = savedCard || cardToSave;
      
      // Update state
      setCard(finalCard);
      setShowEditor(false);
      setShareUrl(`${window.location.origin}/${username}`);
      
      // Show success message
      const storageType = useSupabase ? 'Supabase' : 'localStorage';
      alert(`🎉 Kartu berhasil disimpan ke ${storageType}!`);
      
    } catch (err) {
      console.error('Save card error:', err);
      setError('Gagal menyimpan kartu. Silakan coba lagi.');
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

  // Remove error state blocking - always show the card interface

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
                {card ? 'Edit Kartu' : 'Buat Kartu Baru'}
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

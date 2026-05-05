import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CardEditorEnhanced from './CardEditorEnhanced';
import { supabase } from '../lib/supabaseClient';

// Helper function to get theme text class
const getThemeTextClass = (themeColor) => {
  const themeClasses = {
    pink: 'text-pink-600',
    violet: 'text-violet-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600'
  };
  return themeClasses[themeColor] || 'text-pink-600';
};

// Helper function to parse stickers from string
const parseStickers = (stickersString) => {
  if (!stickersString) return ['≡ƒÄë', '≡ƒÄé', '≡ƒÄü'];
  return stickersString.split(',').filter(s => s.trim());
};

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
      
      console.log('≡ƒöì Loading card for username:', username);
      
      // Always try localStorage first as guaranteed fallback
      const savedCard = localStorage.getItem(`birthday-card-${username}`);
      if (savedCard) {
        try {
          const parsedCard = JSON.parse(savedCard);
          console.log('Γ£à Found card in localStorage:', parsedCard);
          setCard(parsedCard);
          setLoading(false);
          return;
        } catch (parseError) {
          console.log('Γ¥î Error parsing localStorage card:', parseError);
          localStorage.removeItem(`birthday-card-${username}`);
        }
      }
      
      // Try Supabase if available
      if (supabase) {
        try {
          console.log('≡ƒöì Trying Supabase...');
          const { data, error } = await supabase
            .from('birthday_cards')
            .select('*')
            .eq('username', username)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.log('Γ¥î Supabase error:', error);
            if (error.message?.includes('column') || error.message?.includes('does not exist')) {
              console.log('≡ƒÜ¿ Table structure mismatch - using localStorage only');
              setError('Database structure mismatch. Using local storage.');
            } else {
              console.log('ΓÜá∩╕Å Other Supabase error:', error.message);
            }
          } else if (error.code === 'PGRST116') {
            console.log('Γä╣∩╕Å No card found in Supabase (normal for new cards)');
          } else if (data) {
            console.log('Γ£à Found card in Supabase:', data);
            setCard(data);
            // Also save to localStorage as backup
            localStorage.setItem(`birthday-card-${username}`, JSON.stringify(data));
          }
        } catch (supabaseError) {
          console.log('Γ¥î Supabase connection error:', supabaseError);
          console.log('≡ƒÜ¿ Using localStorage fallback');
        }
      } else {
        console.log('Γä╣∩╕Å Supabase not configured, using localStorage only');
      }
      
      setLoading(false);
    };

    if (username) {
      fetchCard();
    } else {
      // No username provided (root path), show editor immediately
      setLoading(false);
      setShowEditor(true);
    }
  }, [username]);

  const handleCreateCard = () => {
    setShowEditor(true);
  };

  const handleSaveCard = async (cardData) => {
    setSaving(true);
    
    try {
      console.log('≡ƒÆ╛ Saving enhanced card for username:', username);
      
      // Prepare card data with ALL enhanced features
      const cardToSave = {
        username: username,
        recipient: cardData.recipient || 'Teman',
        sender: cardData.sender || 'Sahabat',
        message: cardData.message || '≡ƒÄë Happy Birthday!\n\nSemoga harimu menyenangkan!',
        image_url: cardData.imageUrl || '',
        image_position: cardData.imagePosition || { x: 50, y: 20 },
        text_position: cardData.textPosition || { x: 50, y: 70 },
        image_scale: cardData.imageScale || 1.0,
        text_size: cardData.textSize || 'text-lg',
        theme_color: cardData.themeColor || 'pink',
        background: cardData.background || 'gradient1',
        background_color: cardData.backgroundColor || '#ffffff',
        show_stickers: cardData.showStickers !== false,
        stickers: cardData.stickers ? parseStickers(cardData.stickers).join(',') : '≡ƒÄë,≡ƒÄé,≡ƒÄü',
        sticker_positions: cardData.stickerPositions || [
          { emoji: '≡ƒÄë', x: 10, y: 10 },
          { emoji: '≡ƒÄé', x: 80, y: 10 },
          { emoji: '≡ƒÄü', x: 50, y: 85 }
        ],
        sound_enabled: cardData.soundEnabled !== false,
        custom_sound: cardData.customSound || 'default',
        effects: cardData.effects || {
          confetti: true,
          sparkles: true,
          floating: true
        },
        updated_at: new Date().toISOString()
      };

      console.log('≡ƒô¥ Enhanced card data prepared:', cardToSave);

      // ALWAYS save to localStorage first (guaranteed)
      localStorage.setItem(`birthday-card-${username}`, JSON.stringify(cardToSave));
      console.log('Γ£à Saved to localStorage (guaranteed)');

      // Try Supabase if available (optional enhancement)
      if (supabase) {
        try {
          console.log('≡ƒöä Trying Supabase save...');
          
          // Handle image upload if needed
          let imageUrl = cardData.imageUrl;
          if (cardData.imageUrl && cardData.imageUrl.startsWith('data:')) {
            console.log('≡ƒôñ Uploading image to Supabase Storage...');
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
              console.log('ΓÜá∩╕Å Image upload failed:', uploadError);
              throw uploadError;
            }

            const { data } = supabase.storage.from('birthday-cards').getPublicUrl(filename);
            imageUrl = data.publicUrl;
            cardToSave.image_url = imageUrl;
            console.log('Γ£à Image uploaded to Supabase:', imageUrl);
          }

          // Save to database
          const { data, error } = await (card 
            ? supabase.from('birthday_cards').update(cardToSave).eq('username', username).select()
            : supabase.from('birthday_cards').insert([cardToSave]).select());

          if (error) {
            console.log('Γ¥î Supabase database error:', error);
            throw error;
          }
          
          console.log('Γ£à Saved to Supabase database:', data[0]);
          
          // Update local storage with Supabase data
          localStorage.setItem(`birthday-card-${username}`, JSON.stringify(data[0]));
          
        } catch (supabaseError) {
          console.log('ΓÜá∩╕Å Supabase save failed, using localStorage only:', supabaseError);
          // Continue with localStorage only - app still works perfectly
        }
      }

      // Update state with saved data
      setCard(cardToSave);
      setShowEditor(false);
      setShareUrl(`${window.location.origin}/${username}`);
      
      // Show success message
      alert('≡ƒÄë Kartu kustom berhasil dibuat dan disimpan!');
      
    } catch (err) {
      console.error('≡ƒÆÑ Save card error:', err);
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

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ≡ƒÄë Kartu Ucapan untuk @{username}
          </h1>
          <p className="text-gray-600">
            {card?.recipient || 'Sahabat Spesial'}
          </p>
        </div>

        {/* Card Display */}
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-[2rem] p-8 shadow-xl border border-gray-200" style={card?.background === 'solid' ? { backgroundColor: card?.background_color } : {}}>
            {/* Stickers */}
            {card?.show_stickers && card?.sticker_positions?.map((sticker, index) => (
              <div
                key={index}
                className="absolute text-2xl select-none"
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {sticker.emoji}
              </div>
            ))}

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
              <p className={`${card.text_size || 'text-lg'} font-bold whitespace-pre-line ${getThemeTextClass(card?.theme_color)}`}>
                {card?.message || 'Tulis pesanmu di sini...'}
              </p>
              <p className={`text-sm mt-2 ${getThemeTextClass(card?.theme_color)}`}>
                Dari: {card?.sender || 'Namamu'}
              </p>
            </div>

            {/* Recipient Name */}
            <div className="absolute top-4 left-4">
              <p className={`text-sm font-medium ${getThemeTextClass(card?.theme_color)}`}>
                Untuk: {card?.recipient || 'Nama Penerima'}
              </p>
            </div>

            {/* Effects Indicators */}
            <div className="absolute top-4 right-4 flex gap-2">
              {card?.effects?.confetti && <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">≡ƒÄè</span>}
              {card?.effects?.sparkles && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Γ£¿</span>}
              {card?.effects?.floating && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">≡ƒÄê</span>}
              {card?.sound_enabled && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">≡ƒöè</span>}
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
                  text: card?.message?.slice(0, 100), 
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

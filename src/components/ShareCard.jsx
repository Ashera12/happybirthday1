import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CardEditor from './CardEditor';

export default function ShareCard({ username, onClose }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const fetchCard = () => {
      setLoading(true);
      setError('');
      
      // ALWAYS use localStorage - no database dependencies
      console.log('Loading card from localStorage for:', username);
      
      try {
        const savedCard = localStorage.getItem(`birthday-card-${username}`);
        if (savedCard) {
          const parsedCard = JSON.parse(savedCard);
          console.log('Found saved card:', parsedCard);
          setCard(parsedCard);
        } else {
          console.log('No saved card found for:', username);
          setCard(null); // No existing card
        }
      } catch (err) {
        console.log('Error loading from localStorage:', err);
        setCard(null);
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
      console.log('Saving card to localStorage for:', username);
      
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
        updated_at: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem(`birthday-card-${username}`, JSON.stringify(cardToSave));
      console.log('Card saved successfully:', cardToSave);
      
      // Update state
      setCard(cardToSave);
      setShowEditor(false);
      setShareUrl(`${window.location.origin}/${username}`);
      
      // Show success message
      alert('🎉 Kartu berhasil dibuat dan disimpan!');
      
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

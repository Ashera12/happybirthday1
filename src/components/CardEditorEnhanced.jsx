import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const THEMES = {
  pink: { bg: 'from-pink-100 to-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
  violet: { bg: 'from-violet-100 to-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  blue: { bg: 'from-blue-100 to-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'from-green-100 to-green-50', text: 'text-green-600', border: 'border-green-200' },
  yellow: { bg: 'from-yellow-100 to-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  red: { bg: 'from-red-100 to-red-50', text: 'text-red-600', border: 'border-red-200' }
};

const BACKGROUNDS = {
  gradient1: 'bg-gradient-to-br from-pink-50 via-violet-50 to-blue-50',
  gradient2: 'bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50',
  gradient3: 'bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50',
  gradient4: 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50',
  solid: 'bg-white',
  dark: 'bg-gray-900'
};

const STICKERS = ['🎉', '🎂', '🎁', '💖', '🌟', '✨', '🎈', '🎊', '🎋', '🌸', '🌺', '🦄', '🎯', '💫', '🌙', '⭐', '☀️', '🌈', '🎪'];

export default function CardEditorEnhanced({ card, onSave, onClose }) {
  const [editingCard, setEditingCard] = useState({
    recipient: card?.recipient || 'Teman',
    sender: card?.sender || 'Sahabat',
    message: card?.message || '🎉 Happy Birthday!\n\nSemoga harimu menyenangkan!',
    imageUrl: card?.image_url || '',
    imagePosition: card?.image_position || { x: 50, y: 20 },
    textPosition: card?.text_position || { x: 50, y: 70 },
    imageScale: card?.image_scale || 1.0,
    textSize: card?.text_size || 'text-lg',
    themeColor: card?.theme_color || 'pink',
    background: card?.background || 'gradient1',
    backgroundColor: card?.background_color || '#ffffff',
    showStickers: card?.show_stickers !== false,
    stickers: card?.stickers || ['🎉', '🎂', '🎁'],
    stickerPositions: card?.sticker_positions || [
      { emoji: '🎉', x: 10, y: 10 },
      { emoji: '🎂', x: 80, y: 10 },
      { emoji: '🎁', x: 50, y: 85 }
    ],
    soundEnabled: card?.sound_enabled !== false,
    customSound: card?.custom_sound || 'default',
    effects: card?.effects || {
      confetti: true,
      sparkles: true,
      floating: true
    }
  });
  
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isDraggingSticker, setIsDraggingSticker] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedSticker, setSelectedSticker] = useState(null);
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditingCard(prev => ({ ...prev, imageUrl: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (element, e, index = null) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const position = element === 'image' ? editingCard.imagePosition : 
                    element === 'text' ? editingCard.textPosition :
                    editingCard.stickerPositions[index];
    
    const x = ((position.x / 100) * rect.width) - e.clientX;
    const y = ((position.y / 100) * rect.height) - e.clientY;

    setDragOffset({ x, y });
    
    if (element === 'image') {
      setIsDraggingImage(true);
    } else if (element === 'text') {
      setIsDraggingText(true);
    } else {
      setIsDraggingSticker(true);
      setSelectedSticker(index);
    }
  };

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    let newX, newY;

    if (isDraggingImage) {
      newX = ((e.clientX + dragOffset.x) / rect.width) * 100;
      newY = ((e.clientY + dragOffset.y) / rect.height) * 100;
      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));
      setEditingCard(prev => ({ ...prev, imagePosition: { x: newX, y: newY } }));
    } else if (isDraggingText) {
      newX = ((e.clientX + dragOffset.x) / rect.width) * 100;
      newY = ((e.clientY + dragOffset.y) / rect.height) * 100;
      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));
      setEditingCard(prev => ({ ...prev, textPosition: { x: newX, y: newY } }));
    } else if (isDraggingSticker && selectedSticker !== null) {
      newX = ((e.clientX + dragOffset.x) / rect.width) * 100;
      newY = ((e.clientY + dragOffset.y) / rect.height) * 100;
      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));
      const newStickerPositions = [...editingCard.stickerPositions];
      newStickerPositions[selectedSticker] = {
        ...newStickerPositions[selectedSticker],
        x: newX,
        y: newY
      };
      setEditingCard(prev => ({ ...prev, stickerPositions: newStickerPositions }));
    }
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
    setIsDraggingText(false);
    setIsDraggingSticker(false);
    setSelectedSticker(null);
  };

  const addSticker = (emoji) => {
    const newSticker = {
      emoji,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10
    };
    setEditingCard(prev => ({
      ...prev,
      stickers: [...prev.stickers, emoji],
      stickerPositions: [...prev.stickerPositions, newSticker]
    }));
  };

  const removeSticker = (index) => {
    const newStickers = editingCard.stickers.filter((_, i) => i !== index);
    const newPositions = editingCard.stickerPositions.filter((_, i) => i !== index);
    setEditingCard(prev => ({
      ...prev,
      stickers: newStickers,
      stickerPositions: newPositions
    }));
  };

  const resetToDefault = () => {
    setEditingCard({
      recipient: 'Teman',
      sender: 'Sahabat',
      message: '🎉 Happy Birthday!\n\nSemoga harimu menyenangkan!',
      imageUrl: '',
      imagePosition: { x: 50, y: 20 },
      textPosition: { x: 50, y: 70 },
      imageScale: 1.0,
      textSize: 'text-lg',
      themeColor: 'pink',
      background: 'gradient1',
      backgroundColor: '#ffffff',
      showStickers: true,
      stickers: ['🎉', '🎂', '🎁'],
      stickerPositions: [
        { emoji: '🎉', x: 10, y: 10 },
        { emoji: '🎂', x: 80, y: 10 },
        { emoji: '🎁', x: 50, y: 85 }
      ],
      soundEnabled: true,
      customSound: 'default',
      effects: {
        confetti: true,
        sparkles: true,
        floating: true
      }
    });
  };

  const handleSave = () => {
    onSave(editingCard);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    
    if (isDraggingImage || isDraggingText || isDraggingSticker) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDraggingImage, isDraggingText, isDraggingSticker, dragOffset, selectedSticker]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex h-full">
          {/* Left Side - Preview */}
          <div className="w-1/2 p-6 border-r border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Preview Kartu</h3>
            <div 
              ref={cardRef}
              className={`relative h-96 rounded-xl overflow-hidden ${BACKGROUNDS[editingCard.background]}`}
              style={editingCard.background === 'solid' ? { backgroundColor: editingCard.backgroundColor } : {}}
            >
              {/* Stickers */}
              {editingCard.showStickers && editingCard.stickerPositions.map((sticker, index) => (
                <div
                  key={index}
                  className="absolute text-2xl cursor-move select-none"
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseDown={(e) => handleMouseDown('sticker', e, index)}
                >
                  {sticker.emoji}
                </div>
              ))}
              
              {/* Image */}
              {editingCard.imageUrl && (
                <div
                  className="absolute cursor-move select-none"
                  style={{
                    left: `${editingCard.imagePosition.x}%`,
                    top: `${editingCard.imagePosition.y}%`,
                    transform: `translate(-50%, -50%) scale(${editingCard.imageScale})`
                  }}
                  onMouseDown={(e) => handleMouseDown('image', e)}
                >
                  <img 
                    src={editingCard.imageUrl} 
                    alt="Card" 
                    className="w-32 h-32 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Text */}
              <div
                className="absolute cursor-move select-none max-w-[80%] text-center"
                style={{
                  left: `${editingCard.textPosition.x}%`,
                  top: `${editingCard.textPosition.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseDown={(e) => handleMouseDown('text', e)}
              >
                <p className={`${editingCard.textSize} font-bold whitespace-pre-line ${THEMES[editingCard.themeColor].text}`}>
                  {editingCard.message}
                </p>
                <p className={`text-sm mt-2 ${THEMES[editingCard.themeColor].text}`}>
                  Dari: {editingCard.sender}
                </p>
              </div>

              {/* Recipient */}
              <div className="absolute top-4 left-4">
                <p className={`text-sm font-medium ${THEMES[editingCard.themeColor].text}`}>
                  Untuk: {editingCard.recipient}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Controls */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Editor Kartu</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Basic Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penerima</label>
                <input
                  type="text"
                  value={editingCard.recipient}
                  onChange={(e) => setEditingCard(prev => ({ ...prev, recipient: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengirim</label>
                <input
                  type="text"
                  value={editingCard.sender}
                  onChange={(e) => setEditingCard(prev => ({ ...prev, sender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan Ucapan</label>
                <textarea
                  value={editingCard.message}
                  onChange={(e) => setEditingCard(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Theme */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tema Warna</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(THEMES).map(color => (
                  <button
                    key={color}
                    onClick={() => setEditingCard(prev => ({ ...prev, themeColor: color }))}
                    className={`p-2 rounded-lg border-2 ${editingCard.themeColor === color ? THEMES[color].border : 'border-gray-200'} ${THEMES[color].bg} ${THEMES[color].text}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Background */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(BACKGROUNDS).map(bg => (
                  <button
                    key={bg}
                    onClick={() => setEditingCard(prev => ({ ...prev, background: bg }))}
                    className={`p-2 rounded-lg border-2 ${editingCard.background === bg ? 'border-blue-500' : 'border-gray-200'} ${BACKGROUNDS[bg]}`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
              {editingCard.background === 'solid' && (
                <input
                  type="color"
                  value={editingCard.backgroundColor}
                  onChange={(e) => setEditingCard(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="mt-2 w-full h-10 rounded cursor-pointer"
                />
              )}
            </div>

            {/* Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Pilih Foto
              </button>
              {editingCard.imageUrl && (
                <div className="mt-2">
                  <img src={editingCard.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>

            {/* Image Controls */}
            {editingCard.imageUrl && (
              <div className="mb-6 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran Foto</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={editingCard.imageScale}
                    onChange={(e) => setEditingCard(prev => ({ ...prev, imageScale: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-center">{(editingCard.imageScale * 100).toFixed(0)}%</div>
                </div>
              </div>
            )}

            {/* Text Size */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ukuran Teks</label>
              <select
                value={editingCard.textSize}
                onChange={(e) => setEditingCard(prev => ({ ...prev, textSize: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="text-sm">Kecil</option>
                <option value="text-base">Sedang</option>
                <option value="text-lg">Normal</option>
                <option value="text-xl">Besar</option>
                <option value="text-2xl">Sangat Besar</option>
              </select>
            </div>

            {/* Stickers */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Stiker Emoticon</label>
                <button
                  onClick={() => setEditingCard(prev => ({ ...prev, showStickers: !prev.showStickers }))}
                  className={`px-3 py-1 rounded-full text-xs ${editingCard.showStickers ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {editingCard.showStickers ? 'Tampilkan' : 'Sembunyikan'}
                </button>
              </div>
              {editingCard.showStickers && (
                <div className="space-y-2">
                  <div className="grid grid-cols-8 gap-2">
                    {STICKERS.map(sticker => (
                      <button
                        key={sticker}
                        onClick={() => addSticker(sticker)}
                        className="p-2 text-lg hover:bg-gray-100 rounded"
                      >
                        {sticker}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    Klik stiker untuk menambah, drag untuk memindahkan. Total: {editingCard.stickers.length}
                  </div>
                </div>
              )}
            </div>

            {/* Effects */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Efek Visual</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingCard.effects.confetti}
                    onChange={(e) => setEditingCard(prev => ({ 
                      ...prev, 
                      effects: { ...prev.effects, confetti: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Confetti</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingCard.effects.sparkles}
                    onChange={(e) => setEditingCard(prev => ({ 
                      ...prev, 
                      effects: { ...prev.effects, sparkles: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Sparkles</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingCard.effects.floating}
                    onChange={(e) => setEditingCard(prev => ({ 
                      ...prev, 
                      effects: { ...prev.effects, floating: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Floating Animation</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={resetToDefault}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset ke Default
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Simpan Kartu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CardEditor({ card, onSave, onClose }) {
  const [editingCard, setEditingCard] = useState({
    recipient: card?.recipient || '',
    sender: card?.sender || '',
    message: card?.message || '',
    imageUrl: card?.image_url || '',
    imagePosition: card?.image_position || { x: 50, y: 20 },
    textPosition: card?.text_position || { x: 50, y: 70 },
    imageScale: card?.image_scale || 1,
    textSize: card?.text_size || 'text-lg'
  });
  
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
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

  const handleMouseDown = (element, e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const position = element === 'image' ? editingCard.imagePosition : editingCard.textPosition;
    const x = ((position.x / 100) * rect.width) - e.clientX;
    const y = ((position.y / 100) * rect.height) - e.clientY;

    setDragOffset({ x, y });
    
    if (element === 'image') {
      setIsDraggingImage(true);
    } else {
      setIsDraggingText(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDraggingImage && !isDraggingText) return;
    
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX + dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY + dragOffset.y) / rect.height) * 100;

    if (isDraggingImage) {
      setEditingCard(prev => ({
        ...prev,
        imagePosition: { 
          x: Math.max(0, Math.min(100, x)), 
          y: Math.max(0, Math.min(100, y)) 
        }
      }));
    } else if (isDraggingText) {
      setEditingCard(prev => ({
        ...prev,
        textPosition: { 
          x: Math.max(0, Math.min(100, x)), 
          y: Math.max(0, Math.min(100, y)) 
        }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
    setIsDraggingText(false);
  };

  useEffect(() => {
    if (isDraggingImage || isDraggingText) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingImage, isDraggingText, dragOffset]);

  const handleSave = () => {
    onSave(editingCard);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Edit Kartu Ucapan</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ├ù
            </button>
          </div>
        </div>

        <div className="p-6 grid lg:grid-cols-2 gap-6">
          {/* Preview Card */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Preview</h3>
            <div 
              ref={cardRef}
              className="relative bg-gradient-to-br from-pink-50 to-violet-50 rounded-[1.5rem] h-96 overflow-hidden border border-pink-200"
            >
              {/* Image */}
              {editingCard.imageUrl && (
                <div
                  className="absolute cursor-move"
                  style={{
                    left: `${editingCard.imagePosition.x}%`,
                    top: `${editingCard.imagePosition.y}%`,
                    transform: `translate(-50%, -50%) scale(${editingCard.imageScale})`
                  }}
                  onMouseDown={(e) => handleMouseDown('image', e)}
                >
                  <img 
                    src={editingCard.imageUrl} 
                    alt="Card image" 
                    className="w-32 h-32 object-cover rounded-lg shadow-lg"
                    draggable={false}
                  />
                </div>
              )}

              {/* Text */}
              <div
                className="absolute cursor-move max-w-[80%] text-center"
                style={{
                  left: `${editingCard.textPosition.x}%`,
                  top: `${editingCard.textPosition.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseDown={(e) => handleMouseDown('text', e)}
              >
                <p className={`${editingCard.textSize} font-semibold text-gray-800 whitespace-pre-line`}>
                  {editingCard.message || 'Tulis pesanmu di sini...'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Dari: {editingCard.sender || 'Namamu'}
                </p>
              </div>

              {/* Recipient Name */}
              <div className="absolute top-4 left-4">
                <p className="text-sm text-pink-600 font-medium">
                  Untuk: {editingCard.recipient || 'Nama Penerima'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Drag gambar dan teks untuk mengatur posisi</p>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Penerima
              </label>
              <input
                type="text"
                value={editingCard.recipient}
                onChange={(e) => setEditingCard(prev => ({ ...prev, recipient: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Nama penerima"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Namamu
              </label>
              <input
                type="text"
                value={editingCard.sender}
                onChange={(e) => setEditingCard(prev => ({ ...prev, sender: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Namamu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pesan
              </label>
              <textarea
                value={editingCard.message}
                onChange={(e) => setEditingCard(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Tulis pesan ucapan..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {editingCard.imageUrl ? 'Ganti Foto' : 'Pilih Foto'}
              </button>
            </div>

            {editingCard.imageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ukuran Foto: {Math.round(editingCard.imageScale * 100)}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={editingCard.imageScale}
                  onChange={(e) => setEditingCard(prev => ({ ...prev, imageScale: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ukuran Teks
              </label>
              <select
                value={editingCard.textSize}
                onChange={(e) => setEditingCard(prev => ({ ...prev, textSize: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="text-sm">Kecil</option>
                <option value="text-base">Sedang</option>
                <option value="text-lg">Besar</option>
                <option value="text-xl">Sangat Besar</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition"
              >
                Simpan
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import {
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';

import { supabase } from '../lib/supabaseClient';

const finalText = [
  'Happy Birthday 🎉',
  'Semoga setiap hari baru membawamu lebih dekat ke semua impianmu.',
  'Terima kasih sudah menjalani perjalanan kecil ini sampai akhir. 💖',
];

export default function FinalMessage({ onReset }) {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showStickers, setShowStickers] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [customMessage, setCustomMessage] = useState(finalText.join('\n\n'));
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (index >= finalText.length) return;
    const line = finalText[index];
    if (charIndex > line.length) {
      const nextTimer = window.setTimeout(() => {
        setIndex((current) => current + 1);
        setCharIndex(0);
      }, 1100);
      return () => window.clearTimeout(nextTimer);
    }

    const timer = window.setTimeout(() => {
      setText(line.slice(0, charIndex));
      setCharIndex((current) => current + 1);
    }, 45);

    return () => window.clearTimeout(timer);
  }, [charIndex, index]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowStickers(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (selected) {
      setFile(selected);
    } else {
      setFile(null);
    }
  };

  const handleCreateShare = async () => {
    setSaving(true);
    setSaveError('');
    setShareUrl('');

    if (!supabase) {
      setSaveError('Supabase belum dikonfigurasi. Fitur share tidak tersedia.');
      setSaving(false);
      return;
    }

    try {
      const id = (crypto.randomUUID && crypto.randomUUID()) || `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      let imageUrl = null;

      if (file) {
        const ext = file.name.split('.').pop();
        const filename = `${id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('birthday-cards')
          .upload(filename, file, { cacheControl: '3600', upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from('birthday-cards').getPublicUrl(filename);
        imageUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase.from('birthday_cards').insert([
        {
          id,
          recipient,
          sender,
          message: customMessage,
          image_url: imageUrl,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      const url = `${window.location.origin}/share/${id}`;
      setShareUrl(url);
    } catch (err) {
      console.error('Share creation error:', err);
      setSaveError(err?.message || 'Gagal membuat link share. Pastikan koneksi internet stabil.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      setSaveError('Gagal menyalin link, silakan coba manual.');
    }
  };

  const currentShareUrl = shareUrl || window.location.href;

  return (
    <section className="kotak mx-auto max-w-3xl rounded-[2rem] border border-white/80 bg-white/95 p-8 shadow-glow">
      <div className="decor decor-tl"></div>
      <div className="decor decor-br"></div>
      <div className="relative overflow-hidden rounded-[2rem] border border-pink-100 bg-gradient-to-br from-white via-fuchsia-50 to-violet-50 p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute left-5 top-5 h-24 w-24 rounded-full bg-pink-300 blur-3xl" />
          <div className="absolute right-8 top-14 h-16 w-16 rounded-full bg-violet-300 blur-3xl" />
          <div className="absolute left-16 bottom-10 h-20 w-20 rounded-full bg-fuchsia-300 blur-3xl" />
        </div>
        <div className="relative">
          <div className="mb-6 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-pink-500">Final message</p>
            <h2 className="mt-3 text-4xl font-semibold text-slate-900">Pesan Akhir</h2>
          </div>

          <div className="mb-6 flex justify-center gap-4">
            <div className={`stiker stiker-a ${showStickers ? 'stiker-visible' : ''}`}>💌</div>
            <div className={`stiker stiker-b ${showStickers ? 'stiker-visible' : ''}`}>✨</div>
            <div className={`stiker stiker-c ${showStickers ? 'stiker-visible' : ''}`}>🌸</div>
          </div>

          <img 
            src="https://htmlku.com/0/panda/terlope.gif" 
            alt="" 
            className="mx-auto mb-6 h-40 w-40"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDE2MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiByeD0iMjAiIGZpbGw9IiNGRkVGRkYiLz4KPHRleHQgeD0iODAiIHk9Ijg1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiPkVudmVsb3BlPC90ZXh0Pgo8L3N2Zz4=';
              console.log('Envelope image failed to load, using fallback');
            }}
          />

          <div className="space-y-5 text-center text-lg text-slate-700">
            <motion.p animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl font-semibold text-slate-900">
              {text}
            </motion.p>
          </div>

          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-700">Nama yang ulang tahun</label>
                <input
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  placeholder="Misal: Adek, Sahabat, atau Nama"
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-700">Namamu</label>
                <input
                  value={sender}
                  onChange={(event) => setSender(event.target.value)}
                  placeholder="Misal: Dari aku"
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-700">Pesan spesial</label>
                <textarea
                  value={customMessage}
                  onChange={(event) => setCustomMessage(event.target.value)}
                  rows={4}
                  className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-4 py-5 text-center text-slate-500 transition hover:border-pink-300 hover:bg-pink-50">
                  <span className="block text-sm">Upload foto untuk kartu</span>
                  <span className="mt-3 block text-2xl">📷</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview foto" className="h-28 w-28 rounded-[1.5rem] object-cover shadow-sm" />
                ) : (
                  <div className="flex h-28 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-100 text-sm text-slate-500">
                    Belum ada foto dipilih
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button
              onClick={handleCreateShare}
              disabled={saving}
              className="rounded-full bg-pink-500 px-5 py-4 text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Membuat link...' : 'Buat Link Share'}
            </button>
            <button
              onClick={onReset}
              className="rounded-full border border-slate-200 bg-white px-5 py-4 text-slate-800 shadow-sm transition hover:border-pink-300 hover:text-pink-600"
            >
              Mulai Lagi
            </button>
          </div>

          {saveError && <p className="mt-4 text-sm text-red-500">{saveError}</p>}

          {shareUrl && (
            <div className="mt-6 rounded-[1.5rem] border border-pink-100 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Link share berhasil dibuat:</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="rounded-full bg-violet-500 px-5 py-3 text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-600"
                >
                  Salin Link
                </button>
              </div>
              <button
                onClick={() => navigator.share?.({ title: `Kartu untuk ${recipient || 'Teman'}`, text: customMessage.slice(0, 100), url: shareUrl })}
                className="mt-4 w-full rounded-full bg-pink-500 px-5 py-3 text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-600"
              >
                Share Langsung
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function ShareView({ shareId, onClose }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error: fetchError } = await supabase
          .from('birthday_cards')
          .select('id, recipient, sender, message, image_url, created_at')
          .eq('id', shareId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setCard(data);
      } catch (err) {
        setError(err?.message || 'Data tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchCard();
    }
  }, [shareId]);

  return (
    <section className="kotak mx-auto max-w-3xl rounded-[2rem] border border-white/80 bg-white/95 p-8 shadow-glow">
      <div className="decor decor-tl" />
      <div className="decor decor-br" />
      <div className="relative overflow-hidden rounded-[2rem] border border-pink-100 bg-gradient-to-br from-white via-fuchsia-50 to-violet-50 p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute left-5 top-5 h-24 w-24 rounded-full bg-pink-300 blur-3xl" />
          <div className="absolute right-8 top-14 h-16 w-16 rounded-full bg-violet-300 blur-3xl" />
        </div>
        <div className="relative">
          <div className="mb-6 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-pink-500">Share Card</p>
            <h2 className="mt-3 text-4xl font-semibold text-slate-900">Lihat Kartu Ucapan</h2>
          </div>
          {loading ? (
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-300 border-t-transparent" />
              </div>
              <p className="text-slate-600">Memuat kartu ucapan...</p>
            </div>
          ) : error ? (
            <div className="space-y-4 text-center text-slate-700">
              <p className="text-lg font-semibold text-red-500">Gagal memuat.</p>
              <p>{error}</p>
              <button onClick={onClose} className="rounded-full bg-pink-500 px-5 py-3 text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-600">
                Kembali ke Halaman Utama
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {card?.image_url && (
                <img src={card.image_url} alt="Foto Ucapan" className="mx-auto h-72 w-full max-w-xl rounded-[2rem] object-cover shadow-lg" />
              )}
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.35em] text-pink-500">Untuk</p>
                <h3 className="mt-2 text-3xl font-semibold text-slate-900">{card.recipient || 'Sahabat Spesial'}</h3>
                <p className="mt-4 whitespace-pre-line text-slate-700">{card.message}</p>
                <p className="mt-6 text-right text-sm text-slate-500">Dari, {card.sender || 'Pengirim Rahasia'}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button onClick={onClose} className="rounded-full bg-pink-500 px-5 py-3 text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-600">
                  Kembali ke Halaman Utama
                </button>
                <button
                  onClick={() => navigator.share?.({ title: 'Kartu Ucapan Spesial', text: card.message.slice(0, 100), url: window.location.href })}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-800 shadow-sm transition hover:border-pink-300 hover:text-pink-600"
                >
                  Bagikan Kartu Ini
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

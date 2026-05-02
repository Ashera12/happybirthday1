import { useState } from 'react';

import { motion } from 'framer-motion';
import { Howl } from 'howler';

const createSound = (src, volume = 0.7) => {
  try {
    return new Howl({ src: [src], volume });
  } catch (e) {
    return {
      play: () => {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.play().catch(() => {});
      },
    };
  }
};

const blowSfx = createSound('https://assets.mixkit.co/sfx/preview/mixkit-wind-blowing-3558.wav', 0.7);

export default function Cake({ onDone }) {
  const [blown, setBlown] = useState(false);
  const [hint, setHint] = useState('Klik tombol sekali untuk tiup lilin.');

  const handleBlow = () => {
    if (blown) return;
    try {
      if (blowSfx) {
        blowSfx.play();
      }
    } catch (e) {
      console.log('Audio failed:', e);
    }
    setBlown(true);
    setHint('Harapanmu sudah terbang, saatnya pesan akhir ✨');
    window.setTimeout(onDone, 2000);
  };

  return (
    <section className="kotak mx-auto max-w-3xl rounded-[2rem] border border-white/80 bg-white/95 p-8 shadow-glow">
      <div className="decor decor-tl"></div>
      <div className="decor decor-br"></div>
      <div className="grid gap-6 text-center">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-pink-500">Moment Harapan</p>
          <h2 className="text-3xl font-semibold text-slate-900">Tiup Lilinnya</h2>
          <p className="mt-2 text-slate-600">Sebelum pesan akhir, tutup matamu dan buat satu permintaan manis.</p>
        </div>

        <div className="relative mx-auto flex h-72 w-72 items-center justify-center rounded-[2rem] border border-pink-100 bg-pink-50/95 shadow-inner">
          <img src="https://htmlku.com/0/panda/kue.gif" alt="" className="pointer-events-none absolute inset-0 z-0 h-full w-full rounded-[2rem] object-cover opacity-20" />
          <motion.div
            animate={blown ? { y: -20, opacity: 0 } : { y: 0, opacity: 1 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="absolute top-10 z-20 flex h-24 w-24 items-center justify-center rounded-full bg-white/80 shadow-lg"
          >
            <span className="text-5xl">✨</span>
          </motion.div>
          <div className="absolute bottom-10 z-30 flex h-40 w-48 flex-col items-center justify-end gap-2 rounded-[3rem] bg-white p-4 shadow-xl">
            {/* Lilin */}
            <div className="lilin-container">
              <div className="lilin">
                <div className={`api ${blown ? 'mati' : ''}`} id="apiLilin"></div>
              </div>
            </div>
            {/* Kue dengan lapisan */}
            <div className="kue">
              <div className="lapisan lapisan-atas">
                <div className="krim"></div>
                <div className="krim"></div>
                <div className="krim"></div>
              </div>
              <div className="lapisan lapisan-tengah">
                <div className="coklat"></div>
                <div className="coklat"></div>
                <div className="coklat"></div>
                <div className="coklat"></div>
              </div>
              <div className="lapisan lapisan-bawah">
                <div className="coklat"></div>
                <div className="coklat"></div>
                <div className="coklat"></div>
                <div className="coklat"></div>
                <div className="coklat"></div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-600">{hint}</p>
        {blown && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-500 border-t-transparent"></div>
            <span className="text-sm text-slate-600">Memproses harapan...</span>
          </div>
        )}
        <button
          onClick={handleBlow}
          className="mx-auto rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 px-8 py-3 text-white shadow-lg shadow-fuchsia-400/30 transition hover:scale-[1.02]"
        >
          {blown ? 'Harapan terkirim...' : 'Tiup Lilin 🌬️'}
        </button>
      </div>
    </section>
  );
}

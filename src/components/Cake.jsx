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

      <div className="grid gap-8 text-center">

        <div>

          <p className="text-sm uppercase tracking-[0.35em] text-pink-500">Moment Harapan</p>

          <h2 className="text-3xl font-semibold text-slate-900">Tiup Lilinnya</h2>

          <p className="mt-2 text-slate-600">Sebelum pesan akhir, tutup matamu dan buat satu permintaan manis.</p>

        </div>



        {/* Cake Section */}

        <div className="relative mx-auto flex h-64 w-96 items-center justify-center rounded-[2rem] overflow-hidden">

          <motion.div

            className="relative z-20 flex flex-col items-center justify-center gap-4 rounded-[2.5rem] bg-white/95 p-6 shadow-2xl backdrop-blur-md border border-white/60"

            initial={{ y: 24, opacity: 0 }}

            animate={{ y: 0, opacity: 1 }}

            transition={{ duration: 0.7, ease: 'easeOut' }}

          >

            <motion.div

              className="cake-gif-container"

              animate={blown ? { scale: 1.05, y: -10 } : { scale: 1, y: 0 }}

              transition={{ duration: 0.8, ease: 'easeOut' }}

            >

              <img

                src="https://htmlku.com/0/panda/kue.gif"

                alt="Cake with blowing candle"

                className="cake-gif"

              />

            </motion.div>

          </motion.div>

        </div>



        <p className="text-slate-600 mt-6">{hint}</p>

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


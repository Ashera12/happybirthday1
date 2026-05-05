import {

  useEffect,

  useState,

} from 'react';



import { motion } from 'framer-motion';

import { Howl } from 'howler';



const createSound = (src, volume = 0.8) => {

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



const openSfx = createSound('https://assets.mixkit.co/sfx/preview/mixkit-quick-win-video-game-notification-269.wav', 0.8);



export default function Envelope({ onNext }) {

  const [opened, setOpened] = useState(false);



  useEffect(() => {

    if (opened) {

      try {

        if (openSfx) {

          openSfx.play();

        }

      } catch (e) {

        console.log('Audio failed:', e);

      }

    }

  }, [opened]);



  const handleOpen = () => {

    setOpened(true);

    window.setTimeout(onNext, 750);

  };



  return (

    <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-glow">

      <div className="flex flex-col items-center gap-6 text-center">

        <div className="relative w-full max-w-lg">

          <motion.div

            animate={opened ? { rotateX: 180, y: -18 } : { rotateX: 0 }}

            transition={{ duration: 0.8, ease: 'easeOut' }}

            className="envelope-shell mx-auto"

          >

            <div className="envelope-flap" />

            <div className="envelope-paper">

              <p className="text-lg font-semibold text-slate-900">Surprise is loading...</p>

            </div>

          </motion.div>

        </div>



        <div className="max-w-xl rounded-[2rem] border border-pink-100 bg-pink-50/80 px-6 py-5">

          <h2 className="text-2xl font-semibold text-slate-900">Amplop spesial sudah menunggu</h2>

          <p className="mt-3 text-slate-600">Klik tombol di bawah untuk membuka hadiah.</p>

        </div>



        <button

          onClick={handleOpen}

          disabled={opened}

          className={`inline-flex items-center justify-center rounded-full px-8 py-3 text-white shadow-xl shadow-pink-400/20 transition hover:scale-[1.02] ${opened ? 'cursor-not-allowed bg-slate-300' : 'bg-gradient-to-r from-pink-500 to-violet-500 hover:opacity-95'}`}

        >

          {opened ? 'Buka segera...' : 'Buka Amplop'}

        </button>

      </div>

    </section>

  );

}


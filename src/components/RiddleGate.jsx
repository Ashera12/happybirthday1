import {
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';
import { Howl } from 'howler';

const correctAnswer = 'kamu';

const createSound = (src, volume = 0.8) => {
  try {
    return new Howl({ 
      src: [src], 
      volume,
      html5: true,
      onloaderror: function() {
        console.log(`Howl load error for: ${src}`);
      },
      onplayerror: function() {
        console.log(`Howl play error for: ${src}`);
      }
    });
  } catch (e) {
    console.log(`Failed to create Howl for ${src}:`, e);
    return {
      play: () => {
        try {
          const audio = new Audio(src);
          audio.volume = volume;
          audio.play().catch((error) => {
            console.log(`Audio fallback failed for ${src}:`, error);
          });
        } catch (fallbackError) {
          console.log(`Audio fallback creation failed for ${src}:`, fallbackError);
        }
      },
    };
  }
};

const successSfx = createSound('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.wav', 0.8);

export default function RiddleGate({ onSuccess }) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    if (hintVisible) {
      const timer = window.setTimeout(() => setHintVisible(false), 3800);
      return () => window.clearTimeout(timer);
    }
  }, [hintVisible]);

  const checkAnswer = () => {
    const normalized = answer.trim().toLowerCase();
    if (!normalized) {
      setError('Isi jawaban dulu yaa 😊');
      return;
    }
    if (normalized === correctAnswer) {
      try {
        if (successSfx) {
          successSfx.play();
        }
      } catch (e) {
        console.log('Audio failed:', e);
      }
      onSuccess();
      return;
    }
    setError('Sedikit meleset, coba ulang dengan hati-hati 💌');
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="envelope-card mx-auto max-w-3xl rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-glow"
    >
      <div className="mb-6 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-pink-500">Gerbang pertama</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">Tebak siapa yang aku maksud?</h2>
        <p className="mt-2 text-slate-600">Jawabanmu akan membuka pintu kado spesial.</p>
      </div>

      <div className="grid gap-4 rounded-[2rem] border border-pink-100 bg-pink-50/90 p-6">
        <p className="text-base text-slate-700">
          Siapa yang selalu ada di pikiranku setiap hari, bahkan sebelum tidur? 💭
        </p>

        <input
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
            setError('');
          }}
          placeholder="Tulis jawabanmu di sini"
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={checkAnswer}
            className="inline-flex items-center justify-center rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-600"
          >
            Cek Jawaban
          </button>
          <button
            onClick={() => setHintVisible(true)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-pink-300 hover:text-pink-600"
          >
            Butuh petunjuk?
          </button>
        </div>

        <div className="min-h-[32px] text-sm text-red-500">
          {error || (hintVisible && 'Petunjuk: jawab dengan kata yang selalu ada saat memikirkan kamu 🩷')}
        </div>
      </div>
    </motion.section>
  );
}

import {
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';

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

          <img src="https://htmlku.com/0/panda/terlope.gif" alt="" className="mx-auto mb-6 h-40 w-40" />

          <div className="space-y-5 text-center text-lg text-slate-700">
            <motion.p animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl font-semibold text-slate-900">
              {text}
            </motion.p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => window.navigator.share?.({
                title: 'Kado Spesial Untukmu',
                text: 'Lihat pesan spesial ini!',
                url: window.location.href,
              })}
              className="rounded-full bg-pink-500 px-5 py-3 text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-600"
            >
              Share
            </button>
            <button
              onClick={onReset}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-800 shadow-sm transition hover:border-pink-300 hover:text-pink-600"
            >
              Mulai Lagi
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

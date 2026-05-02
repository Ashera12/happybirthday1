import {
  useEffect,
  useMemo,
  useState,
} from 'react';

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

const flipSound = createSound('https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-notification-218.wav', 0.45);
const matchSound = createSound('https://assets.mixkit.co/sfx/preview/mixkit-video-game-positive-interface-239.wav', 0.7);

const dates = [16, 27, 21, 94, 95];

function buildCards() {
  return [...dates, ...dates]
    .map((date, index) => ({ id: `${date}-${index}`, date, revealed: false, matched: false }))
    .sort(() => Math.random() - 0.5);
}

export default function MemoryGame({ onComplete }) {
  const [cards, setCards] = useState(() => buildCards());
  const [openedIndexes, setOpenedIndexes] = useState([]);
  const [message, setMessage] = useState('Cocokkan semua pasangan untuk lanjut!');

  useEffect(() => {
    if (openedIndexes.length !== 2) return;
    const [first, second] = openedIndexes;
    const timer = window.setTimeout(() => {
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.date === secondCard.date) {
        setCards((current) =>
          current.map((card, index) =>
            index === first || index === second ? { ...card, matched: true } : card
          )
        );
        setMessage('Tanggal cocok! Terus semangat ✨');
        matchSound.play();
      } else {
        setCards((current) =>
          current.map((card, index) =>
            index === first || index === second ? { ...card, revealed: false } : card
          )
        );
        setMessage('Ups, tanggalnya beda. Coba lagi dengan santai 🙂');
      }
      setOpenedIndexes([]);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [openedIndexes, cards]);

  const completed = useMemo(() => cards.every((card) => card.matched), [cards]);

  const handleFlip = (index) => {
    if (openedIndexes.length === 2) return;
    if (cards[index].revealed || cards[index].matched) return;

    flipSound.play();
    setCards((current) => current.map((card, idx) => (idx === index ? { ...card, revealed: true } : card)));
    setOpenedIndexes((current) => [...current, index]);
  };

  const resetGame = () => {
    setCards(buildCards());
    setOpenedIndexes([]);
    setMessage('Mulai ulang dan cocokin semua tanggal yang sama!');
  };

  return (
    <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/80 bg-white/95 p-6 shadow-glow">
      <div className="grid gap-6 text-center">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-pink-500">Mini Game</p>
          <h2 className="text-3xl font-semibold text-slate-900">Susun Tanggal</h2>
          <p className="mt-2 text-slate-600">Balik kartu dan cocokin tanggal-tanggal yang sama untuk membuka lanjutan cerita.</p>
        </div>

        <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-slate-700">{message}</p>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
            {cards.map((card, index) => (
              <motion.button
                key={card.id}
                type="button"
                onClick={() => handleFlip(index)}
                whileTap={{ scale: 0.98 }}
                className={`aspect-square rounded-2xl border-2 text-lg font-semibold shadow-sm transition ${
                  card.revealed || card.matched ? 'bg-violet-100 border-violet-300 text-slate-900' : 'bg-slate-300 border-slate-400 text-slate-300'
                }`}
              >
                {card.revealed || card.matched ? card.date : '?'}
              </motion.button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={resetGame}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-pink-300 hover:text-pink-600"
            >
              Ulangi
            </button>
            {completed && (
              <button
                onClick={onComplete}
                className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
              >
                Lanjutkan 🎉
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import Cake from './components/Cake';
import Envelope from './components/Envelope';
import FinalMessage from './components/FinalMessage';
import MemoryGame from './components/MemoryGame';
import RiddleGate from './components/RiddleGate';

const steps = [
  'Teka-teki',
  'Buka Amplop',
  'Memory Game',
  'Tiup Lilin',
  'Pesan Akhir',
];

export default function App() {
  const [step, setStep] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [savedStep, setSavedStep] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('kado-final-progress');
    if (saved) {
      const savedStepValue = Number(saved);
      if (Number.isInteger(savedStepValue) && savedStepValue >= 0 && savedStepValue <= steps.length - 1) {
        setSavedStep(savedStepValue);
      }
    }

    const timer = window.setTimeout(() => {
      setHasLoaded(true);
      setIsReady(true);
    }, 850);

    return () => window.clearTimeout(timer);
  }, []);

  const bgMusicRef = useRef(null);

  useEffect(() => {
    const audioSources = [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      'https://cdn.pixabay.com/download/audio/2021/11/24/audio_7a6e87cf0f.mp3',
    ];

    const tryPlayAudio = (index = 0) => {
      if (index >= audioSources.length) {
        console.log('Background music unavailable in this environment');
        return;
      }

      const audio = new Audio(audioSources[index]);
      audio.volume = 0.2;
      audio.loop = true;
      audio.crossOrigin = 'anonymous';

      const onCanPlay = () => {
        audio.play().catch(() => {
          audio.removeEventListener('canplay', onCanPlay);
          tryPlayAudio(index + 1);
        });
      };

      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('error', () => {
        audio.removeEventListener('canplay', onCanPlay);
        tryPlayAudio(index + 1);
      });

      bgMusicRef.current = audio;
    };

    tryPlayAudio();

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleStart = useCallback(
    (resume = false) => {
      const nextStep = resume && savedStep !== null ? savedStep : 0;
      setStep(nextStep);
      setHasStarted(true);
      localStorage.setItem('kado-final-progress', String(nextStep));
      if (bgMusicRef.current) {
        bgMusicRef.current.play().catch(() => {
          console.log('Background music blocked until interaction next time');
        });
      }
    },
    [savedStep]
  );

  useEffect(() => {
    if (!hasLoaded || !hasStarted) return;
    localStorage.setItem('kado-final-progress', String(step));
  }, [hasLoaded, hasStarted, step]);

  const goNext = useCallback(() => {
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }, []);

  const resetProgress = useCallback(() => {
    setStep(0);
    setHasStarted(false);
    localStorage.removeItem('kado-final-progress');
  }, []);

  const currentComponent = useMemo(() => {
    if (!hasLoaded) {
      return <PageLoading />;
    }

    if (!hasStarted) {
      return (
        <IntroScreen
          onStart={() => handleStart(false)}
          onResume={() => handleStart(true)}
          ready={isReady}
          savedStep={savedStep}
        />
      );
    }

    switch (step) {
      case 0:
        return <RiddleGate onSuccess={goNext} />;
      case 1:
        return <Envelope onNext={goNext} />;
      case 2:
        return <MemoryGame onComplete={goNext} />;
      case 3:
        return <Cake onDone={goNext} />;
      case 4:
        return <FinalMessage onReset={resetProgress} />;
      default:
        return <RiddleGate onSuccess={goNext} />;
    }
  }, [hasLoaded, hasStarted, isReady, step, handleStart, goNext, resetProgress]);

  const showCakeEffect = hasStarted && step === 3;
  const showFloatingStickers = !hasStarted || step === 4;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(138,92,246,0.2),_transparent_28%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6 sm:px-6">
        <main className="relative flex grow items-center justify-center">
          {showCakeEffect && (
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
              <img src="https://htmlku.com/0/panda/semprot.gif" alt="" className="h-32 w-32 opacity-30" />
            </div>
          )}
          {showFloatingStickers && (
            <div className="pointer-events-none absolute inset-x-0 top-6 z-50 flex items-center justify-center gap-4 px-4 sm:px-0">
              <span className="stiker-floating stiker-a">✨</span>
              <span className="stiker-floating stiker-b">🎀</span>
              <span className="stiker-floating stiker-c">💌</span>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={hasStarted ? step : 'intro'}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative z-20 w-full"
            >
              {currentComponent}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function PageLoading() {
  return (
    <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/80 bg-white/95 p-10 text-center shadow-glow">
      <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-pink-100">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-pink-300 border-t-transparent" />
      </div>
      <p className="text-sm uppercase tracking-[0.35em] text-pink-500">Memuat kejutan</p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-900">Sedang menyiapkan semuanya...</h1>
      <p className="mt-3 text-slate-600">Tunggu sebentar, setelah siap kamu bisa mulai petualangannya.</p>
    </section>
  );
}

function IntroScreen({ onStart, onResume, ready, savedStep }) {
  return (
    <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/80 bg-white/95 p-8 shadow-glow">
      <div className="decor decor-tl" />
      <div className="decor decor-br" />
      <div className="relative overflow-hidden rounded-[2rem] border border-pink-100 bg-gradient-to-br from-white via-fuchsia-50 to-violet-50 p-8 shadow-xl">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute left-5 top-5 h-24 w-24 rounded-full bg-pink-300 blur-3xl" />
          <div className="absolute right-8 top-14 h-16 w-16 rounded-full bg-violet-300 blur-3xl" />
        </div>
        <div className="relative">
          <div className="mb-6 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-pink-500">Kejutan Spesial</p>
            <h2 className="mt-3 text-4xl font-semibold text-slate-900">Selamat Datang</h2>
          </div>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-pink-100 p-4 text-center shadow-md shadow-pink-200/60">
              <p className="text-3xl">🪄</p>
              <p className="mt-2 text-sm text-slate-600">Teka-teki</p>
            </div>
            <div className="rounded-3xl bg-violet-100 p-4 text-center shadow-md shadow-violet-200/60">
              <p className="text-3xl">✉️</p>
              <p className="mt-2 text-sm text-slate-600">Amplop</p>
            </div>
            <div className="rounded-3xl bg-fuchsia-100 p-4 text-center shadow-md shadow-fuchsia-200/60">
              <p className="text-3xl">🎂</p>
              <p className="mt-2 text-sm text-slate-600">Lilin</p>
            </div>
          </div>
          <p className="mx-auto max-w-xl text-center text-lg leading-8 text-slate-700">
            Yuk mulai perjalanan hadiah ini. Pecahkan teka-teki terlebih dahulu, lalu buka amplop, mainkan permainan kecil, dan tiup lilinnya sampai ke pesan akhir.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              onClick={onStart}
              disabled={!ready}
              className={`rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg transition ${ready ? 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/20' : 'cursor-not-allowed bg-slate-300 shadow-slate-200'}`}
            >
              {ready ? 'Mulai Petualangan' : 'Menyiapkan data...'}
            </button>
            {ready && savedStep !== null && savedStep > 0 && (
              <button
                onClick={onResume}
                className="rounded-full border border-pink-500 bg-white px-8 py-4 text-lg font-semibold text-pink-600 shadow-sm transition hover:bg-pink-50"
              >
                Lanjutkan dari stage sebelumnya
              </button>
            )}
            {!ready && <p className="text-sm text-slate-500">Tunggu sebentar, data sudah dipersiapkan untukmu.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import CreateCard from './components/CreateCard';
import ViewCard from './components/ViewCard';

export default function App() {
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Get username from URL path (e.g., /john-doe)
  const [targetUser, setTargetUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    const pathname = window.location.pathname;
    
    // Check for /username format
    if (pathname.startsWith('/') && pathname.length > 1) {
      const username = pathname.slice(1);
      // Allow alphanumeric, hyphens, underscores
      if (/^[a-zA-Z0-9_-]+$/.test(username)) {
        return username;
      }
    }
    return null;
  });

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

      try {
        const audio = new Audio(audioSources[index]);
        audio.volume = 0.2;
        audio.loop = true;
        audio.crossOrigin = 'anonymous';

        const onCanPlay = () => {
          audio.play().catch((error) => {
            console.log(`Audio play failed for source ${index}:`, error);
            audio.removeEventListener('canplay', onCanPlay);
            tryPlayAudio(index + 1);
          });
        };

        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('error', () => {
          console.log(`Audio error for source ${index}`);
          audio.removeEventListener('canplay', onCanPlay);
          tryPlayAudio(index + 1);
        });

        bgMusicRef.current = audio;
      } catch (error) {
        console.log(`Failed to create audio object for source ${index}:`, error);
        tryPlayAudio(index + 1);
      }
    };

    tryPlayAudio();

    return () => {
      if (bgMusicRef.current) {
        try {
          bgMusicRef.current.pause();
          bgMusicRef.current.currentTime = 0;
        } catch (error) {
          console.log('Error cleaning up audio:', error);
        }
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

    // Check if this is a /username URL (new format)
    if (shareId && !window.location.pathname.startsWith('/share/')) {
      return <ShareCard username={shareId} onClose={() => {
        window.history.replaceState({}, '', '/');
        setShareId(null);
        setStep(0);
        setHasStarted(false);
      }} />;
    }

    // Check if this is a /share/id URL (old format)
    if (shareId && window.location.pathname.startsWith('/share/')) {
      return <ShareView shareId={shareId} onClose={() => {
        window.history.replaceState({}, '', '/');
        setShareId(null);
        setStep(0);
        setHasStarted(false);
      }} />;
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
  }, [hasLoaded, hasStarted, isReady, step, shareId, handleStart, goNext, resetProgress]);

  const showCakeEffect = !shareId && hasStarted && step === 3;
  const showFloatingStickers = !shareId && (!hasStarted || step === 4);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(138,92,246,0.2),_transparent_28%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6 sm:px-6">
        <main className="relative flex grow items-center justify-center">
          {showCakeEffect && (
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
              <img 
                src="https://htmlku.com/0/panda/semprot.gif" 
                alt="" 
                className="h-32 w-32 opacity-30"
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.log('Cake effect image failed to load');
                }}
              />
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
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleCreateCustomCard = () => {
    if (customUrl.trim()) {
      // Navigate to the custom URL
      window.location.href = `/${customUrl.trim()}`;
    }
  };

  return (
    <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/80 bg-white/95 p-8 shadow-glow">
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
          
          {/* Two Options Layout */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Option 1: Play Game */}
            <div className="rounded-[2rem] border border-pink-100 bg-white/80 p-6">
              <h3 className="text-xl font-semibold text-center mb-4 text-slate-900">🎮 Mainkan Game</h3>
              <div className="grid gap-3 sm:grid-cols-3 mb-4">
                <div className="rounded-2xl bg-pink-100 p-3 text-center shadow-md shadow-pink-200/60">
                  <p className="text-2xl">🪄</p>
                  <p className="mt-1 text-xs text-slate-600">Teka-teki</p>
                </div>
                <div className="rounded-2xl bg-violet-100 p-3 text-center shadow-md shadow-violet-200/60">
                  <p className="text-2xl">✉️</p>
                  <p className="mt-1 text-xs text-slate-600">Amplop</p>
                </div>
                <div className="rounded-2xl bg-fuchsia-100 p-3 text-center shadow-md shadow-fuchsia-200/60">
                  <p className="text-2xl">🎂</p>
                  <p className="mt-1 text-xs text-slate-600">Lilin</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 text-center mb-4">
                Mainkan teka-teki, buka amplop, mainkan game, dan tiup lilin!
              </p>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={onStart}
                  disabled={!ready}
                  className={`w-full rounded-full px-6 py-3 text-base font-semibold text-white shadow-lg transition ${ready ? 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/20' : 'cursor-not-allowed bg-slate-300 shadow-slate-200'}`}
                >
                  {ready ? 'Mulai Petualangan' : 'Menyiapkan data...'}
                </button>
                {ready && savedStep !== null && savedStep > 0 && (
                  <button
                    onClick={onResume}
                    className="w-full rounded-full border border-pink-500 bg-white px-6 py-2 text-sm font-semibold text-pink-600 shadow-sm transition hover:bg-pink-50"
                  >
                    Lanjutkan dari stage sebelumnya
                  </button>
                )}
              </div>
            </div>

            {/* Option 2: Create Custom Card */}
            <div className="rounded-[2rem] border border-violet-100 bg-white/80 p-6">
              <h3 className="text-xl font-semibold text-center mb-4 text-slate-900">💌 Buat Kartu Custom</h3>
              <div className="text-center mb-4">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-violet-100 to-pink-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl">🎁</span>
                </div>
                <p className="text-sm text-slate-700 mb-4">
                  Buat kartu ucapan dengan URL custom dan edit semua elemen!
                </p>
              </div>
              
              {!showUrlInput ? (
                <button
                  onClick={() => setShowUrlInput(true)}
                  className="w-full bg-violet-500 text-white px-6 py-3 rounded-full hover:bg-violet-600 transition font-semibold"
                >
                  Buat Kartu Custom
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">@</span>
                    </div>
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      placeholder="nama-teman-kamu"
                      className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      maxLength={30}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Link: {window.location.origin}/<span className="font-semibold">{customUrl || 'nama-teman'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateCustomCard}
                      disabled={!customUrl.trim()}
                      className="flex-1 bg-violet-500 text-white px-4 py-2 rounded-full hover:bg-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      Buat Kartu
                    </button>
                    <button
                      onClick={() => {
                        setShowUrlInput(false);
                        setCustomUrl('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!ready && <p className="text-center text-sm text-slate-500">Tunggu sebentar, data sudah dipersiapkan untukmu.</p>}
        </div>
      </div>
    </section>
  );
}

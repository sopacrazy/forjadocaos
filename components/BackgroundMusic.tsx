import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface BackgroundMusicProps {
  src: string;
  initialVolume?: number;
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ src, initialVolume = 0.3 }) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = initialVolume;

    const tryPlay = () => {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.log("Autoplay bloqueado pelo navegador, aguardando interação.");
        });
    };

    // Tentar autoplay imediato
    tryPlay();

    // Configurar listener para tocar na primeira interação
    const handleInteraction = () => {
      if (audio.paused) {
        audio.play()
           .then(() => setIsPlaying(true))
           .catch(e => console.error("Play falhou:", e));
      }
    };

    // Usar 'capture: true' para garantir que pegamos o evento antes de qualquer stopPropagation
    document.addEventListener('click', handleInteraction, { capture: true, once: true });
    document.addEventListener('keydown', handleInteraction, { capture: true, once: true });
    document.addEventListener('scroll', handleInteraction, { capture: true, once: true });
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleInteraction, { capture: true });
      document.removeEventListener('keydown', handleInteraction, { capture: true });
      document.removeEventListener('scroll', handleInteraction, { capture: true });
    };
  }, [src, initialVolume]);

  const toggleMute = () => {
    if (audioRef.current) {
        const audio = audioRef.current;
        if (audio.muted || audio.paused) {
            audio.muted = false;
            audio.play().then(() => setIsPlaying(true)).catch(console.error);
            setIsMuted(false);
        } else {
            audio.muted = true;
            setIsMuted(true);
        }
    }
  };

  return (
    <>
        <audio 
            ref={audioRef} 
            src={src} 
            loop 
            preload="auto"
        />
        
        <button
            onClick={toggleMute}
            className={`fixed bottom-8 left-20 z-[150] w-10 h-10 rounded-lg backdrop-blur-sm border flex items-center justify-center transition-all duration-300 group ${
                isMuted 
                ? 'bg-slate-900/50 border-slate-700/30 text-slate-500 hover:text-slate-300' 
                : 'bg-purple-900/40 border-purple-500/30 text-purple-400 hover:text-purple-200 hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
            }`}
            title={isMuted ? "Ativar Som" : "Silenciar Música"}
        >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            
            {/* Equalizador animado (apenas visual) */}
            {!isMuted && isPlaying && (
                <div className="absolute -top-1 -right-1 flex gap-0.5 items-end h-2">
                <div className="w-0.5 bg-green-400 animate-[bounce_0.8s_infinite] h-full"></div>
                <div className="w-0.5 bg-green-400 animate-[bounce_1.2s_infinite] h-2/3"></div>
                <div className="w-0.5 bg-green-400 animate-[bounce_0.5s_infinite] h-1/2"></div>
                </div>
            )}
        </button>
    </>
  );
};

export default BackgroundMusic;

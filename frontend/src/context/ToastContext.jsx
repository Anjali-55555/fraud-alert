import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Dynamic Audio Synth via Web Audio API (extremely robust!)
  const playAlertSound = useCallback((type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === 'Critical') {
        // High frequency alarm pulse
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
        
        setTimeout(() => {
          try {
            const ctx2 = new AudioCtx();
            const osc2 = ctx2.createOscillator();
            const gain2 = ctx2.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx2.destination);
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(880, ctx2.currentTime);
            gain2.gain.setValueAtTime(0.08, ctx2.currentTime);
            osc2.start();
            osc2.stop(ctx2.currentTime + 0.12);
          } catch(err){}
        }, 180);
      } else {
        // High quality ping tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {
      console.log('Audio synthesis context blocked or failed:', e.message);
    }
  }, []);

  const addToast = useCallback((title, message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);

    // Trigger audio cues
    if (type === 'error' || type === 'Critical') {
      playAlertSound('Critical');
    } else {
      playAlertSound('info');
    }

    // Auto dismiss after 5s
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [playAlertSound]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, toasts, removeToast }}>
      {children}
      
      {/* Toast Render Portal overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`cursor-pointer p-4 rounded-xl shadow-2xl glass transition-all duration-300 transform translate-y-0 scale-100 flex flex-col gap-1 border-l-4 border ${
              toast.type === 'error' || toast.type === 'Critical'
                ? 'border-l-rose-500 border-rose-500/20 bg-rose-950/20'
                : toast.type === 'warning'
                ? 'border-l-amber-500 border-amber-500/20 bg-amber-950/20'
                : toast.type === 'success'
                ? 'border-l-emerald-500 border-emerald-500/20 bg-emerald-950/20'
                : 'border-l-indigo-500 border-indigo-500/20 bg-indigo-950/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm text-slate-100">{toast.title}</span>
              <span className="text-[10px] text-slate-400">Dismiss</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

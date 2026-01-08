
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Player, GameLog } from '../types.ts';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

const RUSSIAN_CORP_NAMES = [
  "ГазМясПром", "СверхБанк", "Яндексуй-Тех", "ГринВидиа", "МелкоМягкие", 
  "АпплГрыз", "ТеслаТок", "Тонкофф", "ДикиеЯгоды", "Магнит-Сила", 
  "Амазонка-Трейд", "ГуглиКа", "Пятерочка-Стайл", "СамСунь", "Интел-Внутри",
  "РосьНефть", "НордНикель-Блеск", "МэТэСэ-Связь", "АэроПолет", "ВэТэБэ-Плюс",
  "Озон-Дыши", "Сбер-Вселенная", "ЛукОйл-Транс", "МегаФон-Звон", "РусАтом-Энерго",
  "КамАЗ-Богатырь", "АвтоВау-Запчасть", "Пик-Домик", "Лента-Длинная", "Икс5-Групп",
  "Евраз-Сталь", "Черкизово-Мясо", "Мираторг-Агро", "Додо-Пицца", "Вкусно-И-Точка",
  "СпортМастер-Топ", "М-Видео-Звук", "Эльдорадо-Голд", "Ростеле-Ком", "ТикТок-Танцы",
  "Нетфликс-Кино", "Дисней-Парк", "Тойота-Управляй", "Мерседес-Бенц", "Бээмвэ-Драйв",
  "СтарБакс-Кофе", "Пепси-Бола", "Бургер-Кинг-Ойл", "Шаурма-Инвест", "Чебурек-Финанс"
];

const AUDIO_URLS = {
  bg: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  click: 'https://www.soundjay.com/buttons/button-16.mp3',
  ads: 'https://www.soundjay.com/buttons/button-3.mp3',
  sales: 'https://www.soundjay.com/misc/sounds/coins-spilled-1.mp3',
  loan_fix: 'https://www.soundjay.com/misc/sounds/cash-register-05.mp3',
  vacation: 'https://www.soundjay.com/buttons/button-14.mp3',
  docs: 'https://www.soundjay.com/office/paper-rustle-1.mp3',
  black_pr: 'https://www.soundjay.com/buttons/button-50.mp3',
  robbery: 'https://www.soundjay.com/mechanical/lock-01.mp3',
  skip: 'https://www.soundjay.com/buttons/button-10.mp3',
  win: 'https://www.soundjay.com/human/applause-01.mp3',
  fanfare: 'https://www.soundjay.com/misc/sounds/fanfare-01.mp3'
};

const EMOJI_MAP: Record<string, string> = {
  ads: '📢',
  sales: '💰',
  loan_fix: '🏦',
  vacation: '🌴',
  docs: '📄',
  black_pr: '🌑',
  robbery: '🕵️'
};

const BuildingSVG = ({ color, status, isActive, size = 180, activeEmoji }: { color: string, status: string, isActive: boolean, size?: number, activeEmoji?: string | null }) => (
  <div className="relative">
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <motion.g
        animate={{ 
          y: isActive ? -15 : 0,
          filter: status === 'vacation' ? 'grayscale(0.7) blur(2px)' : 'none',
          scale: isActive ? 1.05 : 1
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <rect x="40" y="150" width="120" height="10" rx="5" fill="#1a1c23" />
        <rect x="60" y="40" width="80" height="110" rx="4" fill="#0c0e12" stroke={status === 'bankrupt' ? '#333' : color} strokeWidth="4" />
        {[0, 1, 2, 3].map(row => (
          <g key={row} opacity={status === 'bankrupt' ? 0.1 : 0.6}>
            <rect x="75" y={60 + row * 20} width="15" height="12" rx="2" fill={isActive ? color : '#334155'} />
            <rect x="110" y={60 + row * 20} width="15" height="12" rx="2" fill={isActive ? color : '#334155'} />
          </g>
        ))}
        {isActive && status === 'active' && (
          <motion.circle cx="100" cy="100" r="75" stroke={color} strokeWidth="2" initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 1.4, opacity: 0 }} transition={{ repeat: Infinity, duration: 2 }} />
        )}
        {status === 'vacation' && <text x="100" y="95" textAnchor="middle" fill="white" className="text-[10px] font-black opacity-60 tracking-widest bg-black/50 p-1">ОТПУСК</text>}
        {status === 'bankrupt' && <text x="100" y="95" textAnchor="middle" fill="red" className="text-[10px] font-black opacity-60 tracking-widest">БАНКРОТ</text>}
      </motion.g>
    </svg>
    <AnimatePresence>
      {activeEmoji && (
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.5 }}
          animate={{ y: -80, opacity: 1, scale: 2.5 }}
          exit={{ y: -140, opacity: 0, scale: 3 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 text-4xl"
        >
          {activeEmoji}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const ActionCard = ({ label, sub, icon, onClick, disabled, used, type = 'normal' }: any) => {
  const styles = {
    normal: 'bg-white/5 border-white/5 hover:bg-white/10 text-white/80',
    accent: 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400',
    danger: 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-400',
    success: 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400',
  }[type as 'normal' | 'accent' | 'danger' | 'success'];

  return (
    <button
      disabled={disabled || used}
      onClick={onClick}
      className={`w-full group p-3 md:p-4 rounded-2xl md:rounded-3xl border transition-all text-left flex items-center justify-between relative overflow-hidden ${styles} ${disabled || used ? 'opacity-20 cursor-not-allowed scale-95' : 'active:scale-95'}`}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className="text-xl md:text-2xl">{icon}</div>
        <div className={used ? 'line-through opacity-50' : ''}>
          <div className="text-[10px] md:text-[12px] font-black uppercase tracking-wider leading-tight">{label}</div>
          <div className="text-[8px] md:text-[10px] opacity-60 font-bold uppercase mt-0.5">{sub}</div>
        </div>
      </div>
      {used && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-white/20 tracking-tighter rotate-12">ИСПОЛЬЗОВАНО</div>}
    </button>
  );
};

const VenusGame: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'setup' | 'playing' | 'winner'>('menu');
  const [showSettings, setShowSettings] = useState(false);
  const [audioSettings, setAudioSettings] = useState(() => {
    const saved = localStorage.getItem('venus_audio');
    return saved ? JSON.parse(saved) : { music: true, sfx: true };
  });

  const [mode, setMode] = useState<'solo' | 'friends'>('solo');
  const [numPlayers, setNumPlayers] = useState(4);
  const [startCapital, setStartCapital] = useState(150000);
  const [initialTax, setInitialTax] = useState(10000);
  const [taxMultiplier, setTaxMultiplier] = useState(1.3);
  const [customNames, setCustomNames] = useState<string[]>(Array(5).fill(''));
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [month, setMonth] = useState(1);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [targetDialog, setTargetDialog] = useState<string | null>(null);
  const [activeEmoji, setActiveEmoji] = useState<{playerId: string, emoji: string} | null>(null);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const audioInitialized = useRef(false);

  const playBeep = useCallback((freq = 440, duration = 0.1) => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }, []);

  const initializeAudioEngine = useCallback(() => {
    if (audioInitialized.current) return;
    try {
      if (!bgMusicRef.current) {
        const music = new Audio(AUDIO_URLS.bg);
        music.loop = true;
        music.volume = 0.15;
        bgMusicRef.current = music;
      }
      if (audioSettings.music && bgMusicRef.current) {
        bgMusicRef.current.play().catch(() => {});
      }
      Object.entries(AUDIO_URLS).forEach(([key, url]) => {
        if (key !== 'bg') {
          const audio = new Audio(url);
          audio.preload = 'auto';
          sfxRefs.current[key] = audio;
        }
      });
      audioInitialized.current = true;
    } catch (e) {}
  }, [audioSettings.music]);

  const playSFX = useCallback((type: keyof typeof AUDIO_URLS) => {
    if (!audioSettings.sfx) return;
    if (!audioInitialized.current) initializeAudioEngine();
    const sound = sfxRefs.current[type];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
      sound.play().then(() => {
        // Ограничиваем только короткие звуки. Фанфары и аплодисменты должны играть дольше.
        if (type !== 'win' && type !== 'fanfare' && type !== 'bg') {
          setTimeout(() => {
            sound.pause();
            sound.currentTime = 0;
          }, 1000);
        }
      }).catch(() => {
        const freqs: any = { ads: 660, sales: 880, click: 440, win: 1200, fanfare: 1500, robbery: 200, skip: 300, loan_fix: 550, vacation: 350, docs: 400, black_pr: 700 };
        playBeep(freqs[type] || 440, 0.15);
      });
    } else {
      playBeep(440, 0.1);
    }
  }, [audioSettings.sfx, initializeAudioEngine, playBeep]);

  useEffect(() => {
    const unlock = () => { initializeAudioEngine(); window.removeEventListener('click', unlock); };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, [initializeAudioEngine]);

  useEffect(() => {
    if (bgMusicRef.current) {
      if (audioSettings.music) bgMusicRef.current.play().catch(() => {});
      else bgMusicRef.current.pause();
    }
    localStorage.setItem('venus_audio', JSON.stringify(audioSettings));
  }, [audioSettings.music]);

  // Эффект для торжественного завершения игры
  useEffect(() => {
    if (gameState === 'winner') {
      playSFX('fanfare');
      const applauseTimer = setTimeout(() => {
        playSFX('win');
      }, 1500);
      return () => clearTimeout(applauseTimer);
    }
  }, [gameState, playSFX]);

  const currentPlayer = players[currentIndex];
  const isHumanTurn = currentPlayer && !currentPlayer.isAI && currentPlayer.status !== 'bankrupt';
  const isActionableTurn = isHumanTurn && currentPlayer.status === 'active';

  const currentTaxRate = useMemo(() => {
    if (!currentPlayer) return 0;
    const stages = Math.floor((month - 1) / 6);
    return Math.floor(initialTax * Math.pow(taxMultiplier, stages));
  }, [month, initialTax, taxMultiplier, currentPlayer]);

  const addLog = useCallback((msg: string, type: GameLog['type'] = 'info', color?: string) => {
    setLogs(prev => [{ id: Math.random().toString(), message: msg, type, timestamp: new Date(), playerColor: color }, ...prev].slice(0, 50));
  }, []);

  const nextTurn = useCallback(() => {
    setPlayers(prev => {
      const updatedPlayers = prev.map((p, i) => {
        if (i === currentIndex) {
          let bal = p.balance;
          let st = p.status;
          let vac = p.vacationTurns;
          let loanMonths = p.loanRepaymentMonths;
          if (st === 'vacation') {
            vac--;
            if (vac <= 0) st = 'active';
          } else if (st === 'active') {
            const stages = Math.floor((month - 1) / 6);
            const tax = Math.floor(initialTax * Math.pow(taxMultiplier, stages));
            bal -= tax;
            if (loanMonths > 0) {
              bal -= 10000;
              loanMonths--;
            }
          }
          if (bal <= 0) {
            bal = 0;
            st = 'bankrupt';
            addLog(`${p.name} признана банкротом!`, 'danger', p.color);
          }
          return { ...p, balance: bal, status: st, vacationTurns: vac, loanRepaymentMonths: loanMonths };
        }
        return p;
      });
      const activePlayers = updatedPlayers.filter(p => p.status !== 'bankrupt');
      if (activePlayers.length <= 1) {
        setGameState('winner');
        return updatedPlayers;
      }
      let nextIdx = (currentIndex + 1) % updatedPlayers.length;
      if (nextIdx === 0) setMonth(m => m + 1);
      let safetyCount = 0;
      while (updatedPlayers[nextIdx].status === 'bankrupt' && safetyCount < updatedPlayers.length) {
        nextIdx = (nextIdx + 1) % updatedPlayers.length;
        if (nextIdx === 0) setMonth(m => m + 1);
        safetyCount++;
      }
      setCurrentIndex(nextIdx);
      return updatedPlayers;
    });
  }, [currentIndex, month, initialTax, taxMultiplier, addLog]);

  useEffect(() => {
    if (gameState === 'playing' && currentPlayer) {
      if (currentPlayer.status === 'vacation') {
        const timer = setTimeout(() => {
          addLog(`${currentPlayer.name}: в отпуске, переход хода.`, 'info', currentPlayer.color);
          nextTurn();
        }, 1500);
        return () => clearTimeout(timer);
      }
      const available = ['ads', 'sales', 'loan_fix', 'vacation', 'docs', 'black_pr', 'robbery']
        .filter(a => !currentPlayer.usedActions.includes(a));
      if (available.length === 0 && currentPlayer.status === 'active') {
        const timer = setTimeout(() => {
          addLog(`${currentPlayer.name}: все действия выполнены.`, 'info', currentPlayer.color);
          nextTurn();
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentIndex, gameState, currentPlayer, nextTurn, addLog]);

  const initSetup = (selectedMode: 'solo' | 'friends') => {
    initializeAudioEngine();
    playSFX('click');
    setMode(selectedMode);
    setGameState('setup');
  };

  const startGame = () => {
    playSFX('click');
    const shuffledCorps = [...RUSSIAN_CORP_NAMES].sort(() => Math.random() - 0.5);
    const list: Player[] = [];
    for (let i = 0; i < numPlayers; i++) {
      const isAI = mode === 'solo' && i > 0;
      const defaultName = isAI ? shuffledCorps[i] : `Корпорация ${i + 1}`;
      const name = customNames[i] && customNames[i].trim() !== '' ? customNames[i].trim() : defaultName;
      list.push({ id: (i + 1).toString(), name, balance: startCapital, isAI, status: 'active', vacationTurns: 0, loanRemaining: 0, loanRepaymentMonths: 0, taxDiscount: 0, color: COLORS[i], usedActions: [] });
    }
    setPlayers(list);
    setCurrentIndex(0);
    setMonth(1);
    setLogs([]);
    setGameState('playing');
    addLog("Симуляция запущена.", "success");
  };

  const handleAction = (type: string, targetId?: string) => {
    if (!currentPlayer || currentPlayer.status !== 'active') return;

    const emoji = EMOJI_MAP[type];
    if (emoji) {
      setActiveEmoji({ playerId: targetId || currentPlayer.id, emoji });
      setTimeout(() => setActiveEmoji(null), 3000);
    }
    
    const sfxKey = type as keyof typeof AUDIO_URLS;
    playSFX(AUDIO_URLS[sfxKey] ? sfxKey : 'click');

    setPlayers(prev => {
      const updated = prev.map((p, i) => {
        if (i === currentIndex) {
          const used = [...p.usedActions, type];
          switch (type) {
            case 'ads': return { ...p, balance: p.balance + 50000, usedActions: used };
            case 'sales': return { ...p, balance: p.balance + 25000, usedActions: used };
            case 'loan_fix': return { ...p, balance: p.balance + 50000, loanRepaymentMonths: 6, usedActions: used };
            case 'vacation': return { ...p, status: 'vacation', vacationTurns: 3, usedActions: used };
            case 'robbery': return { ...p, balance: p.balance + 25000, usedActions: used };
            case 'docs':
            case 'black_pr': return { ...p, usedActions: used };
          }
        }
        if (p.id === targetId) {
          switch (type) {
            case 'docs': return { ...p, balance: Math.max(0, p.balance - 50000) };
            case 'black_pr': return { ...p, balance: Math.max(0, p.balance - 25000) };
            case 'robbery': return { ...p, balance: Math.max(0, p.balance - 25000) };
          }
        }
        return p;
      });
      return updated;
    });
    const titles: any = { ads: 'Реклама', sales: 'Продажи', loan_fix: 'Кредит', vacation: 'Отпуск', docs: 'Саботаж', black_pr: 'PR-атака', robbery: 'Ограбление' };
    addLog(`${currentPlayer.name}: ${titles[type]}`, 'info', currentPlayer.color);
    setTargetDialog(null);
    nextTurn();
  };

  const openAttackDialog = (type: string) => {
    playSFX('click');
    setTargetDialog(type);
  }

  const skipTurn = () => { if (!currentPlayer || currentPlayer.status === 'bankrupt') return; playSFX('skip'); nextTurn(); };

  useEffect(() => {
    if (gameState === 'playing' && currentPlayer?.isAI && currentPlayer.status === 'active') {
      const available = ['ads', 'sales', 'loan_fix', 'vacation', 'docs', 'black_pr', 'robbery']
        .filter(a => !currentPlayer.usedActions.includes(a));
      
      if (available.length === 0) { 
        skipTurn(); 
        return; 
      }
      
      const timer = setTimeout(() => {
        const choice = available[Math.floor(Math.random() * available.length)];
        if (['docs', 'black_pr', 'robbery'].includes(choice)) {
          const targets = players.filter(p => p.id !== currentPlayer.id && p.status === 'active');
          if (targets.length > 0) {
            handleAction(choice, targets[Math.floor(Math.random() * targets.length)].id);
          } else {
            handleAction('ads');
          }
        } else {
          handleAction(choice);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, gameState, currentPlayer, players]);

  if (gameState === 'menu') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050608] px-4 h-full">
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center z-10 w-full max-w-lg flex flex-col items-center">
          <h1 className="text-[60px] sm:text-[120px] font-black italic tracking-tighter text-white leading-none mb-4">VENUS</h1>
          <p className="text-white/20 uppercase tracking-[0.2em] mb-12 font-bold text-xs sm:text-base">Industrial Conquest Simulator</p>
          <div className="flex flex-col gap-4 w-full max-w-[320px]">
            <button onClick={() => initSetup('solo')} className="w-full px-10 py-5 bg-indigo-600 rounded-full font-black uppercase tracking-widest text-white shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm">Один игрок</button>
            <button onClick={() => initSetup('friends')} className="w-full px-10 py-5 glass rounded-full font-black uppercase tracking-widest text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-sm">С друзьями</button>
            <button onClick={() => { playSFX('click'); setShowSettings(true); }} className="w-full px-10 py-5 glass rounded-full font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 hover:scale-105 active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Настройки
            </button>
          </div>
        </motion.div>
        <AnimatePresence>
          {showSettings && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-80 p-8 glass rounded-3xl border-white/10">
                <h3 className="text-white font-black uppercase tracking-widest mb-8 text-center">Настройки</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between"><span className="text-white/60 font-bold uppercase text-xs">Музыка</span><button onClick={() => setAudioSettings(s => ({ ...s, music: !s.music }))} className={`w-12 h-6 rounded-full relative transition-all ${audioSettings.music ? 'bg-indigo-600' : 'bg-white/10'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${audioSettings.music ? 'left-7' : 'left-1'}`} /></button></div>
                  <div className="flex items-center justify-between"><span className="text-white/60 font-bold uppercase text-xs">Звуки</span><button onClick={() => setAudioSettings(s => ({ ...s, sfx: !s.sfx }))} className={`w-12 h-6 rounded-full relative transition-all ${audioSettings.sfx ? 'bg-emerald-600' : 'bg-white/10'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${audioSettings.sfx ? 'left-7' : 'left-1'}`} /></button></div>
                </div>
                <button onClick={() => { playSFX('click'); setShowSettings(false); }} className="w-full mt-10 py-4 bg-white text-black font-black uppercase text-xs rounded-xl hover:bg-slate-100 transition-colors">Закрыть</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (gameState === 'setup') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050608] p-6 overflow-y-auto h-full">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-2xl p-6 sm:p-10 rounded-[32px] border-white/10">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-6 text-center text-white/50">Параметры Сессии</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-6">
              <div><div className="flex justify-between items-center mb-2"><label className="text-[10px] font-black uppercase opacity-40">Число корпораций</label><span className="text-indigo-400 font-black">{numPlayers}</span></div><input type="range" min="2" max="5" value={numPlayers} onChange={e => { setNumPlayers(parseInt(e.target.value)); playSFX('click'); }} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500" /></div>
              <div><div className="flex justify-between items-center mb-2"><label className="text-[10px] font-black uppercase opacity-40">Стартовый бюджет</label><span className="text-emerald-400 font-black">{startCapital.toLocaleString()} ₽</span></div><input type="range" min="100000" max="500000" step="50000" value={startCapital} onChange={e => { setStartCapital(parseInt(e.target.value)); playSFX('click'); }} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500" /></div>
              <div><div className="flex justify-between items-center mb-2"><label className="text-[10px] font-black uppercase opacity-40">Начальный налог</label><span className="text-rose-400 font-black">{initialTax.toLocaleString()} ₽</span></div><input type="range" min="5000" max="30000" step="1000" value={initialTax} onChange={e => { setInitialTax(parseInt(e.target.value)); playSFX('click'); }} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500" /></div>
              <div><div className="flex justify-between items-center mb-2"><label className="text-[10px] font-black uppercase opacity-40">Множитель (x)</label><span className="text-rose-500 font-black">x{taxMultiplier.toFixed(1)}</span></div><input type="range" min="1.0" max="5.0" step="0.1" value={taxMultiplier} onChange={e => { setTaxMultiplier(parseFloat(e.target.value)); playSFX('click'); }} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-600" /></div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase opacity-40 block mb-2">Названия компаний</label>
              {Array.from({ length: numPlayers }).map((_, idx) => (
                <div key={idx} className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} /><input type="text" placeholder={mode === 'solo' && idx > 0 ? "Случайное (AI)" : `Название компании ${idx + 1}`} disabled={mode === 'solo' && idx > 0} value={customNames[idx]} onChange={(e) => { const updated = [...customNames]; updated[idx] = e.target.value; setCustomNames(updated); }} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-30" /></div>
              ))}
            </div>
          </div>
          <button onClick={startGame} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-50 transition-colors text-sm">Инициация</button>
          <button onClick={() => { setGameState('menu'); playSFX('skip'); }} className="w-full py-4 mt-2 text-[10px] font-black uppercase opacity-20 hover:opacity-100 transition-opacity tracking-widest text-white">Вернуться</button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'winner') {
    const winner = players.find(p => p.status !== 'bankrupt');
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050608] px-4 overflow-hidden relative h-full">
        {/* Анимированное конфетти из эмодзи */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, x: Math.random() * window.innerWidth, opacity: 0 }}
            animate={{ 
              y: window.innerHeight + 100, 
              opacity: [0, 1, 1, 0],
              rotate: 360 
            }}
            transition={{ 
              duration: 3 + Math.random() * 4, 
              repeat: Infinity, 
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className="absolute text-2xl z-0 pointer-events-none"
          >
            {['💰', '👑', '💎', '📈', '✨'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}

        <motion.div 
          initial={{ scale: 0, rotate: -20 }} 
          animate={{ scale: 1.2, rotate: 0 }} 
          transition={{ type: 'spring', damping: 12 }} 
          className="text-[120px] mb-8 z-10 filter drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]"
        >
          👑
        </motion.div>
        
        <motion.h1 
          initial={{ y: 50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="text-5xl sm:text-7xl font-black text-center text-white mb-4 uppercase italic z-10 tracking-tighter"
        >
          ПОБЕДИТЕЛЬ
        </motion.h1>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ delay: 0.3 }} 
          className="text-3xl sm:text-5xl font-black tracking-widest uppercase py-4 px-12 rounded-[40px] border-4 mb-16 z-10 bg-black/40 backdrop-blur-md" 
          style={{ color: winner?.color, borderColor: winner?.color }}
        >
          {winner?.name || "КОРПОРАЦИЯ"}
        </motion.div>
        
        <button 
          onClick={() => setGameState('menu')} 
          className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all z-10 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
        >
          В главное меню
        </button>
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e1b4b_0%,#050608_80%)] opacity-60" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#050608] flex-col md:flex-row overflow-hidden">
      <div className="flex-[1.5] relative bg-[#07090c] flex flex-col min-h-[50vh] md:min-h-0 border-b md:border-b-0 md:border-r border-white/5">
        <div className="w-full bg-black/60 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3 flex justify-between items-center z-40">
          <div className="flex items-center gap-4 md:gap-6"><button onClick={() => { setGameState('menu'); playSFX('skip'); }} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all flex items-center gap-2"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>Выход</button><span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em]">Месяц {month}</span></div>
          <div className="flex items-center gap-4 md:gap-6"><span className="text-[11px] font-black text-rose-400 uppercase tracking-[0.3em]">Налог: {currentTaxRate.toLocaleString()} ₽</span></div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden">
          <div className={`grid ${players.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-4 md:gap-12 items-center justify-items-center max-w-4xl w-full`}>
            {players.map((p, i) => (
              <motion.div key={p.id} layout className={`flex flex-col items-center p-4 md:p-6 rounded-[30px] md:rounded-[40px] transition-all duration-500 relative ${currentIndex === i ? 'bg-white/5 ring-1 ring-white/10 scale-105' : 'opacity-40'}`}>
                <div className={`mb-3 md:mb-4 px-4 md:px-6 py-1.5 md:py-2 rounded-xl border-2 text-[12px] md:text-[16px] font-black transition-all shadow-lg ${currentIndex === i ? 'bg-white text-black border-white' : 'bg-black border-white/20 text-emerald-400/80'}`}>{p.balance.toLocaleString()} ₽</div>
                <BuildingSVG color={p.color} isActive={currentIndex === i} status={p.status} size={window.innerWidth < 768 ? 100 : 180} activeEmoji={activeEmoji?.playerId === p.id ? activeEmoji.emoji : null} />
                <div className="mt-3 md:mt-5 text-[9px] md:text-[12px] font-black uppercase tracking-[0.2em] text-white text-center font-bold">{p.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 md:w-[420px] glass p-6 sm:p-10 flex flex-col z-30 h-auto md:h-full overflow-hidden">
        <h3 className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.5em] text-white/20 mb-6 hidden md:block text-center">Центральный Узел</h3>
        <div className="flex-1 overflow-y-auto custom-scroll pr-0 sm:pr-4 space-y-6 sm:space-y-8 pb-4">
          <section><h4 className="text-[8px] font-black uppercase text-white/20 mb-3 tracking-widest">Рост активов</h4>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              <ActionCard label="Реклама" sub="+50,000 ₽" icon="📢" onClick={() => handleAction('ads')} used={currentPlayer?.usedActions.includes('ads')} disabled={!isActionableTurn} type="success" />
              <ActionCard label="Продажи" sub="+25,000 ₽" icon="💰" onClick={() => handleAction('sales')} used={currentPlayer?.usedActions.includes('sales')} disabled={!isActionableTurn} type="success" />
              <ActionCard label="Кредит" sub="+50к (6 мес)" icon="🏦" onClick={() => handleAction('loan_fix')} used={currentPlayer?.usedActions.includes('loan_fix')} disabled={!isActionableTurn || (currentPlayer?.loanRepaymentMonths ?? 0) > 0} type="accent" />
              <ActionCard label="Отпуск" sub="Защита (2 хода)" icon="🌴" onClick={() => handleAction('vacation')} used={currentPlayer?.usedActions.includes('vacation')} disabled={!isActionableTurn} />
            </div>
          </section>
          <section><h4 className="text-[8px] font-black uppercase text-white/20 mb-3 tracking-widest">Промышленная агрессия</h4>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              <ActionCard label="Документы" sub="-50,000 ₽ врагу" icon="📄" onClick={() => openAttackDialog('docs')} used={currentPlayer?.usedActions.includes('docs')} disabled={!isActionableTurn} type="danger" />
              <ActionCard label="Black PR" sub="-25,000 ₽ врагу" icon="🌑" onClick={() => openAttackDialog('black_pr')} used={currentPlayer?.usedActions.includes('black_pr')} disabled={!isActionableTurn} type="danger" />
              <ActionCard label="Ограбление" sub="Кража 25,000 ₽" icon="🕵️" onClick={() => openAttackDialog('robbery')} used={currentPlayer?.usedActions.includes('robbery')} disabled={!isActionableTurn} type="danger" />
            </div>
          </section>
          <button onClick={skipTurn} disabled={!isHumanTurn} className="w-full py-4 rounded-2xl border border-white/10 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-white/5 transition-all text-white/40 hover:text-white">Пропустить ход</button>
        </div>
        <div className="pt-4 border-t border-white/5 hidden sm:block">
          <div className="text-[9px] font-black uppercase opacity-20 mb-3 tracking-widest text-center">Протокол</div>
          <div className="h-32 overflow-y-auto space-y-3 custom-scroll pr-2 text-[10px] font-bold">
            {logs.map(log => (<div key={log.id} className="flex gap-3 items-start border-l-2 pl-3" style={{ borderColor: log.playerColor || '#222' }}><span className="opacity-20 font-mono text-[8px] mt-0.5">{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span className="text-white/80 leading-tight">{log.message}</span></div>))}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {targetDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl px-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg p-10 glass rounded-[50px] border-white/10 shadow-2xl">
              <h2 className="text-2xl font-black uppercase text-center mb-10 tracking-tighter text-white">Выбор цели</h2>
              <div className="space-y-3">
                {players.filter(p => p.id !== currentPlayer.id && p.status === 'active').map(p => (
                  <button key={p.id} onClick={() => handleAction(targetDialog, p.id)} className="w-full p-6 rounded-[30px] bg-white/5 border border-white/10 hover:border-rose-500/50 transition-all flex justify-between items-center group"><div className="text-left"><div className="font-black text-xl" style={{ color: p.color }}>{p.name}</div><div className="text-[10px] opacity-30 uppercase font-black tracking-widest mt-1">Капитал: {p.balance.toLocaleString()} ₽</div></div><span className="opacity-0 group-hover:opacity-100 text-rose-500 font-black text-[10px] tracking-[0.3em] transition-all">ВЫБРАТЬ</span></button>
                ))}
                {players.filter(p => p.id !== currentPlayer.id && p.status === 'active').length === 0 && <div className="text-center p-8 opacity-40 font-black uppercase tracking-widest text-sm">Нет доступных целей</div>}
              </div>
              <button onClick={() => { setTargetDialog(null); playSFX('skip'); }} className="w-full mt-8 opacity-30 font-black uppercase text-[10px] tracking-[0.5em] text-white hover:opacity-100">Отмена</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VenusGame;

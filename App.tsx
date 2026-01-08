import React, { useState } from 'react';
import { AppMode } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import VenusGame from './components/VenusGame.tsx';
import { motion, AnimatePresence } from 'framer-motion';

const GenericMode: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-[#050608] p-10 text-center">
    <div className="text-8xl mb-8 opacity-20">{icon}</div>
    <h2 className="text-4xl font-black uppercase tracking-[0.3em] text-white/40 mb-4">{title}</h2>
    <p className="text-white/20 font-bold max-w-md">Модуль находится в режиме интеграции с ядром Gemini. Пожалуйста, используйте симулятор VENUS для текущих операций.</p>
  </div>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('venus');

  const renderContent = () => {
    switch (mode) {
      case 'venus': return <VenusGame />;
      case 'chat': return <GenericMode title="Neural Chat" icon="💬" />;
      case 'search': return <GenericMode title="Global Search" icon="🔍" />;
      case 'image': return <GenericMode title="Visual Forge" icon="🎨" />;
      case 'video': return <GenericMode title="Cine Production" icon="🎬" />;
      case 'voice': return <GenericMode title="Live Core" icon="🎙️" />;
      default: return <VenusGame />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#050608] text-slate-100">
      <Sidebar activeMode={mode} onModeChange={setMode} />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
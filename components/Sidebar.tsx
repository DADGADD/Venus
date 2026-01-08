import React from 'react';
import { AppMode } from '../types.ts';

interface SidebarProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMode, onModeChange }) => {
  const menuItems: { id: AppMode; icon: string; label: string }[] = [
    { id: 'chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', label: 'Chat' },
    { id: 'search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', label: 'Search' },
    { id: 'image', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Forge' },
    { id: 'video', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', label: 'Video' },
    { id: 'voice', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', label: 'Live' },
    { id: 'venus', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1M12 8V7m0 1c-1.11 0-2.08.407-2.67 1M12 8V7m0 11c1.11 0 2.08-.407 2.67-1M12 18v1m0-1c-1.11 0-2.08-.407-2.67-1M12 18v1m-7-4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', label: 'Venus' },
  ];

  return (
    <aside className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-8 gap-8 z-50 h-full">
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
        <span className="text-white font-bold text-xl">V</span>
      </div>
      
      <nav className="flex flex-col gap-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onModeChange(item.id)}
            className={`p-3 rounded-2xl transition-all group relative ${
              activeMode === item.id ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:bg-slate-800'
            }`}
            title={item.label}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100]">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
import React from 'react';
import { AppMode, AppSettings, FontSize } from '../types';
import { MODE_CONFIG } from '../constants';
import { Atom, Settings, PanelLeftClose, LogOut, MapPin, Volume2, Palette, Camera, HelpCircle, Activity, Cpu, Layout, Type, Share2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  settings: AppSettings;
  onSettingsChange: (s: AppSettings) => void;
  onClearHistory: () => void;
  onLocatorClick: () => void;
  onCameraClick: () => void;
  onHelpClick: () => void;
}

const VOICES = ['Zephyr', 'Kore', 'Puck', 'Charon', 'Fenrir'];

const BACKGROUNDS = [
  { id: 'void', name: 'Void', color: '#050505' },
  { id: 'midnight', name: 'Midnight', color: '#0f172a' },
  { id: 'nebula', name: 'Nebula', color: '#1e1b4b' },
  { id: 'forest', name: 'Forest', color: '#022c22' },
  { id: 'obsidian', name: 'Obsidian', color: '#0a0a0a' }
];

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentMode,
  onModeChange,
  settings,
  onSettingsChange,
  onClearHistory,
  onLocatorClick,
  onCameraClick,
  onHelpClick
}) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
      )}
      <aside 
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-72 
          bg-[#050505]/95 border-r border-white/5 backdrop-blur-xl shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col font-sans
        `}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between relative overflow-hidden">
          {/* Subtle glow effect behind header */}
          <div className={`absolute -top-10 -left-10 w-32 h-32 bg-${settings.themeColor}-500/20 blur-3xl rounded-full pointer-events-none`}></div>
          
          <div className="flex items-center gap-3 text-atom-500 relative z-10">
            <div className="relative group">
              <Atom className={`w-8 h-8 text-${settings.themeColor}-400 animate-spin-slow group-hover:text-white transition-colors`} />
              <div className={`absolute inset-0 bg-${settings.themeColor}-400 blur-lg opacity-40 group-hover:opacity-70 transition-opacity`}></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-widest text-white font-mono">ATOM</span>
              <span className={`text-[9px] text-${settings.themeColor}-400 tracking-[0.2em] uppercase flex items-center gap-1`}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors md:hidden">
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          
          {/* Quick Actions Grid */}
          <div>
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Quick Access</h3>
              <Activity className={`w-3 h-3 text-${settings.themeColor}-500`} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onCameraClick} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-atom-500/50 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-atom-500/0 to-atom-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Camera className="w-5 h-5 text-gray-300 group-hover:text-atom-400 group-hover:scale-110 transition-transform relative z-10" />
                <span className="text-[10px] font-medium text-gray-400 relative z-10 font-mono">VISION</span>
              </button>
              <button onClick={onLocatorClick} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-emerald-500/50 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <MapPin className="w-5 h-5 text-gray-300 group-hover:text-emerald-400 group-hover:scale-110 transition-transform relative z-10" />
                <span className="text-[10px] font-medium text-gray-400 relative z-10 font-mono">LOCATOR</span>
              </button>
            </div>
          </div>

          {/* Modes List */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2 font-mono">Neural Protocol</h3>
            <div className="space-y-1">
              {Object.values(AppMode).map((mode) => {
                const config = MODE_CONFIG[mode];
                const Icon = config.icon;
                const isActive = currentMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => onModeChange(mode)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all border relative overflow-hidden group ${
                      isActive 
                        ? `bg-${settings.themeColor}-500/10 text-${settings.themeColor}-400 border-${settings.themeColor}-500/30` 
                        : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-gray-200'
                    }`}
                  >
                    {isActive && <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${settings.themeColor}-500`}></div>}
                    <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                    <span className="text-sm font-medium">{mode}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Section */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2 flex items-center gap-2 font-mono">
              <Settings className="w-3 h-3" /> Config
            </h3>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-5 backdrop-blur-md">
              
              {/* Vocal Output */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-300 flex gap-2 items-center"><Volume2 className="w-3 h-3"/> Vocal Output</span>
                <button
                  onClick={() => onSettingsChange({ ...settings, useTTS: !settings.useTTS })}
                  className={`w-9 h-5 rounded-full relative transition-colors ${settings.useTTS ? `bg-${settings.themeColor}-500` : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${settings.useTTS ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

               {/* Neural Particles */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-300 flex gap-2 items-center"><Share2 className="w-3 h-3"/> Neural Grid</span>
                <button
                  onClick={() => onSettingsChange({ ...settings, showParticles: !settings.showParticles })}
                  className={`w-9 h-5 rounded-full relative transition-colors ${settings.showParticles ? `bg-${settings.themeColor}-500` : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${settings.showParticles ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Voice Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                  <Cpu className="w-3 h-3" /> <span>Voice Module</span>
                </div>
                <div className="relative">
                  <select 
                    value={settings.voice}
                    onChange={(e) => onSettingsChange({...settings, voice: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 text-gray-300 text-xs rounded-lg p-2 appearance-none focus:border-atom-500 outline-none font-mono"
                  >
                    {VOICES.map(v => <option key={v} value={v} className="bg-gray-900">{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Text Size */}
               <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                  <Type className="w-3 h-3" /> <span>Text Density</span>
                </div>
                <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                  {(['small', 'normal', 'large'] as FontSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => onSettingsChange({...settings, fontSize: size})}
                      className={`flex-1 py-1.5 rounded-md text-[10px] uppercase font-bold transition-all ${
                        settings.fontSize === size 
                        ? `bg-${settings.themeColor}-500 text-white shadow-sm` 
                        : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {size === 'small' ? 'A-' : size === 'normal' ? 'A' : 'A+'}
                    </button>
                  ))}
                </div>
              </div>

               {/* Theme Colors */}
               <div className="space-y-2">
                 <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                   <Palette className="w-3 h-3" /> <span>Holo-Theme</span>
                 </div>
                 <div className="flex gap-2 justify-between bg-black/20 p-2 rounded-lg">
                   {['cyan', 'purple', 'emerald', 'rose'].map(color => (
                     <button
                       key={color}
                       onClick={() => onSettingsChange({ ...settings, themeColor: color })}
                       className={`w-5 h-5 rounded-full border-2 transition-all ${settings.themeColor === color ? 'border-white scale-110 shadow-[0_0_10px_currentColor]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                       style={{ backgroundColor: color === 'cyan' ? '#0ea5e9' : color === 'purple' ? '#a855f7' : color === 'emerald' ? '#10b981' : '#f43f5e', color: color === 'cyan' ? '#0ea5e9' : color === 'purple' ? '#a855f7' : color === 'emerald' ? '#10b981' : '#f43f5e' }}
                     />
                   ))}
                 </div>
               </div>

               {/* Backgrounds */}
               <div className="space-y-2">
                 <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                   <Layout className="w-3 h-3" /> <span>Environment</span>
                 </div>
                 <div className="grid grid-cols-5 gap-1 bg-black/20 p-2 rounded-lg">
                   {BACKGROUNDS.map(bg => (
                     <button
                       key={bg.id}
                       onClick={() => onSettingsChange({ ...settings, background: bg.id })}
                       title={bg.name}
                       className={`h-5 rounded-md border transition-all ${settings.background === bg.id ? 'border-white scale-110 shadow-sm' : 'border-transparent opacity-50 hover:opacity-100'}`}
                       style={{ backgroundColor: bg.color }}
                     />
                   ))}
                 </div>
               </div>

            </div>
          </div>
          
          <div className="pt-4 border-t border-white/5 mt-auto flex gap-2">
             <button onClick={onClearHistory} className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-red-400 py-3 rounded-lg hover:bg-white/5 text-[10px] transition-colors border border-transparent hover:border-white/5">
               <LogOut className="w-4 h-4" /> Reset
             </button>
             <button onClick={onHelpClick} className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-atom-400 py-3 rounded-lg hover:bg-white/5 text-[10px] transition-colors border border-transparent hover:border-white/5">
               <HelpCircle className="w-4 h-4" /> Save App
             </button>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
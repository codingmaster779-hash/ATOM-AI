import React, { useState, useEffect, useRef } from 'react';
import { Menu, PanelLeft, Sparkles, Zap, Brain, Radio, MessageSquare, Camera, BookOpen, Code2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import CameraModal from './components/CameraModal';
import InstallGuide from './components/InstallGuide';
import HumanCheck from './components/HumanCheck';
import ParticleBackground from './components/ParticleBackground';
import { generateResponse, speakText } from './services/geminiService';
import { Message, Role, AppMode, AppSettings, Attachment } from './types';
import { DEFAULT_SYSTEM_INSTRUCTION, MODE_CONFIG } from './constants';

function App() {
  // Authentication State with Session Persistence
  const [isVerified, setIsVerified] = useState(() => {
    // Check if user was already verified in this session
    return sessionStorage.getItem('atom_verified') === 'true';
  });

  // Message History (Session Only - No LocalStorage)
  const [messages, setMessages] = useState<Message[]>([]);
  
  // App Settings (Session Only - No LocalStorage)
  const [settings, setSettings] = useState<AppSettings>({ 
    useTTS: false, 
    themeColor: 'cyan', 
    userName: 'User', 
    voice: 'Zephyr',
    background: 'void',
    fontSize: 'normal',
    showParticles: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | undefined>(undefined);
  const [mode, setMode] = useState<AppMode>(AppMode.GENERAL);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Effects
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    
    // Always request location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => setUserLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }), 
        console.error
      );
    }
  }, [messages]);

  const handleVerifySuccess = () => {
    setIsVerified(true);
    // Save to session storage so refresh doesn't reset verification
    sessionStorage.setItem('atom_verified', 'true');
  };

  const handleSend = async (text: string, atts: Attachment[]) => {
    const userMsg: Message = { id: Date.now().toString(), role: Role.USER, text, attachments: atts, timestamp: Date.now() };
    
    setMessages(p => [...p, userMsg]);
    setIsLoading(true);

    try {
      const prompt = `${DEFAULT_SYSTEM_INSTRUCTION}\nMODE: ${MODE_CONFIG[mode].prompt}`;
      const res = await generateResponse(text, atts, messages, prompt, userLocation);
      
      const botMsg: Message = { id: (Date.now()+1).toString(), role: Role.MODEL, text: res.text, webSources: res.webSources, mapSources: res.mapSources, timestamp: Date.now() };
      setMessages(p => [...p, botMsg]);
      if (settings.useTTS) speakText(res.text, settings.voice);
    } catch (err: any) {
      setMessages(p => [...p, { id: Date.now().toString(), role: Role.MODEL, text: err.message, isError: true, timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBackgroundClass = () => {
    switch(settings.background) {
      case 'midnight': return 'bg-slate-950';
      case 'nebula': return 'bg-[#1e1b4b]';
      case 'forest': return 'bg-[#022c22]';
      case 'obsidian': return 'bg-[#0a0a0a]';
      case 'void': default: return 'bg-dark-bg';
    }
  };
  
  const getFontSizeClass = () => {
    switch(settings.fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'normal': default: return 'text-base';
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in z-10">
      <div className="relative mb-10 group cursor-default">
        <div className={`absolute inset-0 bg-${settings.themeColor}-500/20 blur-[80px] rounded-full w-64 h-64 animate-pulse-slow`}></div>
        <div className={`relative w-32 h-32 bg-black/40 border border-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] group-hover:border-${settings.themeColor}-500/30 transition-colors`}>
          <Brain className={`w-16 h-16 text-${settings.themeColor}-400 drop-shadow-[0_0_15px_currentColor]`} />
        </div>
        <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-${settings.themeColor}-500/10 border border-${settings.themeColor}-500/20 rounded-full backdrop-blur-md`}>
          <span className={`text-[10px] font-mono font-bold text-${settings.themeColor}-400 uppercase tracking-widest`}>System Online</span>
        </div>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tighter">ATOM <span className={`text-${settings.themeColor}-400`}>AI</span></h1>
      <p className="text-gray-400 max-w-md mb-12 text-sm md:text-base font-light">
        Futuristic multimodal assistance. <br/> 
        <span className={`text-${settings.themeColor}-400 font-mono`}>Vision • Analysis • Code • Creation</span>
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl">
        <button onClick={() => setIsCameraOpen(true)} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vision</div>
        </button>

        <button onClick={() => setMode(AppMode.CODING)} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
            <Code2 className="w-6 h-6" />
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Coding</div>
        </button>

        <button onClick={() => setMode(AppMode.STUDY)} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Study</div>
        </button>

        <button onClick={() => handleSend("What's happening in the tech world today?", [])} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
            <Radio className="w-6 h-6" />
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">News</div>
        </button>
      </div>
    </div>
  );

  if (!isVerified) {
    return <HumanCheck onVerified={handleVerifySuccess} />;
  }

  return (
    <div className={`flex h-screen ${getBackgroundClass()} ${getFontSizeClass()} text-white font-sans overflow-hidden relative selection:bg-atom-500/30 transition-colors duration-700`}>
      <div className="noise-overlay"></div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`bg-blob blob-1 mix-blend-screen opacity-10 bg-${settings.themeColor}-500 transition-colors duration-1000`}></div>
        <div className="bg-blob blob-2 mix-blend-screen opacity-10 bg-blue-600"></div>
        <div className="bg-blob blob-3 mix-blend-screen opacity-5 bg-purple-600"></div>
      </div>

      {settings.showParticles && <ParticleBackground color={settings.themeColor} />}

      <Sidebar 
        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
        currentMode={mode} onModeChange={setMode}
        settings={settings} onSettingsChange={setSettings}
        onClearHistory={() => setMessages([])}
        onLocatorClick={() => { if(userLocation) handleSend("Find nearby places.", []); else alert("Location needed."); }}
        onCameraClick={() => setIsCameraOpen(true)}
        onHelpClick={() => setIsInstallOpen(true)}
      />

      <main className={`flex-1 flex flex-col h-full relative transition-[margin] duration-500 ease-in-out ${isSidebarOpen ? 'md:ml-72' : ''} z-10`}>
        <header className="h-16 flex items-center justify-between px-6 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(p => !p)} className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              {isSidebarOpen ? <Menu className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border border-${settings.themeColor}-500/30 bg-${settings.themeColor}-500/10 text-${settings.themeColor}-400 uppercase tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.2)]`}>
                {mode} Mode Active
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-[10px] text-gray-500 font-mono hidden sm:block">CPU: NOMINAL</div>
             <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentColor] text-${settings.themeColor}-400 bg-${settings.themeColor}-500 animate-pulse`} />
          </div>
        </header>

        {/* touch-pan-y allows normal vertical scrolling while overscroll-behavior-y: none prevents refresh */}
        <div className="flex-1 overflow-y-auto px-2 md:px-4 py-6 scroll-smooth custom-scrollbar touch-pan-y">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {messages.length === 0 ? <EmptyState /> : (
              <>
                {messages.map(m => <ChatMessage key={m.id} message={m} accentColor={settings.themeColor} />)}
                {isLoading && (
                  <div className="flex items-center gap-3 text-gray-500 text-sm ml-2 animate-pulse mt-4 bg-white/5 self-start px-4 py-3 rounded-xl border border-white/5">
                    <Sparkles className={`w-4 h-4 text-${settings.themeColor}-500 animate-spin`} />
                    <span className="font-mono text-xs uppercase tracking-widest text-gray-400">Neural Core Processing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </>
            )}
          </div>
        </div>

        <div className={`p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent z-20`}>
          <InputArea onSendMessage={handleSend} isLoading={isLoading} onCameraClick={() => setIsCameraOpen(true)} accentColor={settings.themeColor} />
        </div>
      </main>

      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={(b64) => handleSend("Analyze this visual data.", [{data:b64, mimeType:'image/png'}])} currentVoice={settings.voice} />
      <InstallGuide isOpen={isInstallOpen} onClose={() => setIsInstallOpen(false)} />
    </div>
  );
}
export default App;
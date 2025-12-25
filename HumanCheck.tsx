import React, { useState } from 'react';
import { Fingerprint, Copy, ArrowRight, ShieldCheck, Lock, Check } from 'lucide-react';

interface Props {
  onVerified: (key: string) => void;
}

// UPDATED: Now pulls directly from your system configuration (vite.config.ts)
// This ensures the key shown here always matches your actual API key.
const PUBLIC_ACCESS_KEY = process.env.API_KEY_PRIMARY || "PASTE_YOUR_KEY_HERE";

const HumanCheck: React.FC<Props> = ({ onVerified }) => {
  const [inputKey, setInputKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(PUBLIC_ACCESS_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    if (!inputKey.trim()) {
      setError("Please enter the access key.");
      return;
    }
    
    // Basic format validation
    if (!inputKey.startsWith('AIza')) {
       setError("Invalid format. Key must start with 'AIza'.");
       return;
    }

    // Pass the key up to the App component to handle in session memory
    onVerified(inputKey.trim());
  };

  return (
    <div className="h-screen w-full bg-[#050505] flex items-center justify-center p-4 font-sans overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 blur-[100px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Fingerprint className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Human Check Process</h1>
          <p className="text-gray-400 text-sm mt-2">Identity verification required to access Neural Core.</p>
        </div>

        <div className="space-y-6">
          {/* Public Key Display */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Public Access Key
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <code className="flex-1 bg-black/50 p-3 rounded-lg text-cyan-400 font-mono text-xs break-all border border-white/5 relative group">
                {PUBLIC_ACCESS_KEY}
              </code>
              <button 
                onClick={handleCopy}
                className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg border border-white/5 transition-all active:scale-95"
                title="Copy Key"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-xs text-gray-500 font-mono">VERIFICATION</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          {/* Input Area */}
          <div className="space-y-2">
             <label className="text-xs font-medium text-gray-300 ml-1">Paste Key Below</label>
             <input 
               type="text" 
               value={inputKey}
               onChange={(e) => { setInputKey(e.target.value); setError(''); }}
               placeholder="AIzaSy..."
               className="w-full bg-[#0f1219] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-sm"
             />
             {error && <p className="text-red-400 text-xs ml-1">{error}</p>}
          </div>

          <button 
            onClick={handleVerify}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Verify Identity & Enter
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Atom AI Security Protocol v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default HumanCheck;
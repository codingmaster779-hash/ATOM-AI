import React from 'react';
import { X, Smartphone, Download, Share, Laptop, Cloud } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

const InstallGuide: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-dark-surface p-6 rounded-2xl max-w-md w-full border border-dark-border shadow-2xl">
        <div className="flex justify-between mb-4 text-white font-bold text-lg">
          <span>Save Atom AI</span>
          <button onClick={onClose}><X /></button>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg mb-4">
          <h3 className="text-blue-400 font-bold text-sm flex gap-2 items-center"><Cloud className="w-4 h-4"/> Permanent Link</h3>
          <p className="text-xs text-gray-300 mt-1">
             Your Netlify/Vercel link is <strong>permanent</strong>. It does not disappear when you close the tab.
             To keep it like a real app, <strong>Install it</strong> below.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-atom-400 font-bold flex gap-2"><Smartphone className="w-4 h-4" /> Android</h3>
            <p className="text-xs text-gray-400 mt-1">Tap <strong>Menu (3 dots)</strong> -&gt; <strong>Add to Home Screen</strong>.</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
             <h3 className="text-purple-400 font-bold flex gap-2"><Share className="w-4 h-4" /> iOS (iPhone)</h3>
             <p className="text-xs text-gray-400 mt-1">Tap <strong>Share</strong> button -&gt; <strong>Add to Home Screen</strong>.</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
             <h3 className="text-emerald-400 font-bold flex gap-2"><Laptop className="w-4 h-4" /> Desktop</h3>
             <p className="text-xs text-gray-400 mt-1">Click the <strong>Install Icon</strong> <Download className="w-3 h-3 inline"/> in the browser address bar.</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full mt-6 py-3 bg-atom-600 rounded-xl text-white font-bold">Got it</button>
      </div>
    </div>
  );
};
export default InstallGuide;
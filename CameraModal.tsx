import React, { useRef, useEffect, useState } from 'react';
import { X, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { speakText } from './geminiService';

interface CameraModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  onCapture: (base64: string) => void; 
  currentVoice: string; 
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture, currentVoice }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      speakText("Ready for visual input.", currentVoice);
    } else { 
      stopCamera(); 
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    try {
      const constraints = { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      
      let ms: MediaStream;
      try {
        ms = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        ms = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      setStream(ms);
      if (videoRef.current) { 
        videoRef.current.srcObject = ms; 
        // Ensure video is playing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }
    } catch (e) { 
      setError("Camera hardware access denied or unavailable.");
      console.error("Camera Error:", e);
    }
  };

  const stopCamera = () => { 
    if (stream) {
      stream.getTracks().forEach(t => t.stop()); 
      setStream(null); 
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && !isAnalyzing) {
      setIsAnalyzing(true); 
      speakText("Capturing data.", currentVoice);
      
      // Delay capture slightly for effect
      setTimeout(() => {
        const vid = videoRef.current;
        const cnv = canvasRef.current;
        if (!vid || !cnv) return;

        const ctx = cnv.getContext('2d');
        if (!ctx) return;

        cnv.width = vid.videoWidth; 
        cnv.height = vid.videoHeight;
        ctx.drawImage(vid, 0, 0);
        
        const imageData = cnv.toDataURL('image/png').split(',')[1];
        onCapture(imageData);
        onClose();
        setIsAnalyzing(false);
      }, 800);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col font-mono">
      <div className="flex justify-between items-center p-4 z-20 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex gap-2 items-center text-cyan-400 font-bold tracking-tighter">
          <Zap className="w-5 h-5 animate-pulse" /> 
          <span>ATOM VISION SYSTEM</span>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="text-white w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-gray-400">{error}</p>
            <button 
              onClick={startCamera} 
              className="px-4 py-2 bg-white/10 rounded-lg text-sm border border-white/10"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover" 
            />
            {/* HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 m-4">
               <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500"></div>
               <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500"></div>
               <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500"></div>
               <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500"></div>
            </div>
            
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full transition-transform duration-500 ${isAnalyzing ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`} />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-cyan-500/10 backdrop-invert-[0.1] animate-pulse" />
            )}
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="h-40 bg-[#050505] flex justify-center items-center gap-12 z-20 border-t border-white/5">
        <button 
          onClick={takePhoto} 
          disabled={isAnalyzing || !!error} 
          className={`group relative w-20 h-20 rounded-full border-4 transition-all duration-300 ${isAnalyzing ? 'border-gray-700' : 'border-white hover:scale-110 active:scale-90 shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
        >
          <div className={`absolute inset-1 rounded-full bg-white transition-all ${isAnalyzing ? 'scale-0' : 'scale-100'}`} />
          {isAnalyzing && <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
        </button>
        
        {!error && (
          <button 
            onClick={startCamera} 
            className="p-4 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
export default CameraModal;

import React, { useRef, useEffect, useState } from 'react';
import { X, RefreshCw, Zap } from 'lucide-react';
import {  speakText  } from "./services/geminiService";
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
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setTimeout(() => speakText("Ready. Show me.", currentVoice), 800);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setError('');
    setIsAnalyzing(false);
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .catch(() => navigator.mediaDevices.getUserMedia({ video: true }));
      setStream(ms);
      if (videoRef.current) {
        videoRef.current.srcObject = ms;
        await videoRef.current.play();
      }
    } catch (e) {
      setError("Camera access denied.");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      setIsAnalyzing(true);
      speakText("Scanning.", currentVoice);
      setTimeout(() => {
        const vid = videoRef.current!;
        const cnv = canvasRef.current!;
        cnv.width = vid.videoWidth;
        cnv.height = vid.videoHeight;
        cnv.getContext('2d')?.drawImage(vid, 0, 0);
        onCapture(cnv.toDataURL('image/png').split(',')[1]);
        onClose();
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col font-mono">
      <div className="flex justify-between p-4 z-20 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex gap-2 items-center text-atom-400 font-bold"><Zap className="w-5 h-5" /> ATOM VISION</div>
        <button onClick={onClose}><X className="text-white w-8 h-8" /></button>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">
        {error ? <div className="text-red-500">{error}</div> : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full flex items-center justify-center">
                {isAnalyzing && <div className="w-full h-full animate-ping rounded-full bg-atom-400/30" />}
              </div>
              <div className={`absolute left-0 w-full h-1 bg-atom-400 shadow-[0_0_20px_rgba(56,189,248,1)] animate-scan ${isAnalyzing ? 'opacity-100' : 'opacity-40'}`} />
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="h-32 bg-black/80 flex justify-around items-center z-20">
        <button onClick={takePhoto} disabled={!!error || isAnalyzing} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
          <div className={`w-16 h-16 bg-white rounded-full ${isAnalyzing ? 'scale-0' : 'scale-100'} transition-transform`} />
        </button>
        <button onClick={startCamera}><RefreshCw className="text-white w-8 h-8" /></button>
      </div>
    </div>
  );
};
export default CameraModal;

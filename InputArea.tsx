import React, { useState, useRef } from 'react';
import { Send, Mic, Paperclip, Camera, X, Loader2, StopCircle, Sparkles } from 'lucide-react';
import { Attachment } from './types';

interface InputAreaProps { onSendMessage: (text: string, attachments: Attachment[]) => void; isLoading: boolean; onCameraClick: () => void; accentColor: string; }

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, onCameraClick, accentColor }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSend = () => { if ((!text.trim() && attachments.length === 0) || isLoading) return; onSendMessage(text, attachments); setText(''); setAttachments([]); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => setAttachments(prev => [...prev, { data: (reader.result as string).split(',')[1], mimeType: file.type || 'text/plain', name: file.name }]);
        reader.readAsDataURL(file);
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  const toggleRecording = async () => {
    if (isRecording) { mediaRecorderRef.current?.stop(); setIsRecording(false); }
    else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder; audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => { if(e.data.size > 0) audioChunksRef.current.push(e.data); };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const reader = new FileReader();
          reader.onloadend = () => setAttachments(prev => [...prev, { data: (reader.result as string).split(',')[1], mimeType: 'audio/wav', name: 'Voice Command' }]);
          reader.readAsDataURL(audioBlob);
          stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorder.start(); setIsRecording(true);
      } catch (err) { alert("Microphone access denied."); }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 md:px-4 pb-4">
      {attachments.length > 0 && (
        <div className="flex gap-3 px-4 py-3 overflow-x-auto mb-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl mx-2">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative flex items-center bg-white/5 border border-white/10 rounded-lg p-2 pr-8 shrink-0">
              <div className="text-xs text-gray-300 max-w-[150px] truncate font-mono">{att.name || 'Data Packet'}</div>
              <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 p-1 text-gray-500 hover:text-red-400"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}
      <div className="relative group">
        <div className={`absolute -inset-0.5 rounded-2xl bg-${accentColor}-500/20 blur group-hover:opacity-40 transition`}></div>
        <div className="relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-end gap-2 shadow-2xl">
          <div className="flex gap-1 border-r border-white/10 pr-2 mr-1">
            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-white rounded-xl"><Paperclip className="w-5 h-5" /></button>
            <button onClick={onCameraClick} className="p-3 text-gray-400 hover:text-white rounded-xl hidden sm:block"><Camera className="w-5 h-5" /></button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
          <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} placeholder={isRecording ? "Receiving audio..." : "Enter command..."} rows={1} className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none max-h-32 text-base font-medium py-3" />
          <div className="flex gap-2 pl-2">
            <button onClick={toggleRecording} className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'}`}>{isRecording ? <StopCircle className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}</button>
            <button onClick={handleSend} disabled={isLoading || (!text.trim() && attachments.length === 0)} className={`p-3 rounded-xl transition-all ${isLoading || (!text.trim() && attachments.length === 0) ? 'bg-white/5 text-gray-600' : `bg-${accentColor}-600 text-white hover:bg-${accentColor}-500`}`}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      <div className="text-center mt-3 flex items-center justify-center gap-2 opacity-50"><Sparkles className={`w-3 h-3 text-${accentColor}-500`} /><p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Atom Neural Core v2.4</p></div>
    </div>
  );
};
export default InputArea;

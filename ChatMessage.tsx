import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Role } from '../types';
import { Bot, User, FileText, Globe, MapPin, ExternalLink, Cpu, Terminal, Sparkles, Copy, Check } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  accentColor: string;
}

const CodeBlock = ({ children, className }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'code';
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#1e1e1e] shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/5">
        <span className="text-xs font-mono text-gray-400 lowercase">{language}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <code className={`${className} font-mono text-sm text-gray-200 leading-relaxed`}>
          {children}
        </code>
      </div>
    </div>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, accentColor }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-8 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar Bubble */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border border-white/5 relative overflow-hidden group ${isUser ? 'bg-gray-800' : `bg-black`}`}>
           {/* Glow Effect for Bot */}
           {!isUser && <div className={`absolute inset-0 bg-${accentColor}-500/20 blur-md group-hover:bg-${accentColor}-500/30 transition-all`}></div>}
           <div className="relative z-10">
             {isUser ? <User className="w-5 h-5 text-gray-400" /> : <Bot className={`w-6 h-6 text-${accentColor}-400 drop-shadow-[0_0_5px_currentColor]`} />}
           </div>
        </div>

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1 group`}>
          {/* Tech Header for Bot */}
          {!isUser && (
            <div className="flex items-center gap-2 mb-1.5 pl-1 opacity-70">
              <span className={`text-[10px] font-mono text-${accentColor}-400 uppercase tracking-widest flex items-center gap-1.5`}>
                <Cpu className="w-3 h-3" /> Neural Core Response
              </span>
              <span className="text-[10px] text-gray-600 font-mono">:: {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}

          <div className={`
            relative px-6 py-5 rounded-2xl overflow-hidden w-full backdrop-blur-md transition-all duration-300
            ${isUser 
              ? `bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-tr-sm border border-white/10 shadow-lg hover:border-${accentColor}-500/30` 
              : `bg-black/40 border border-white/10 text-gray-100 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-${accentColor}-500/20 hover:bg-black/50`
            }
          `}>
            {/* Decorative Tech Lines for Bot */}
            {!isUser && (
              <>
                <div className={`absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-${accentColor}-500 to-transparent opacity-50`}></div>
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${accentColor}-500/5 blur-2xl rounded-full pointer-events-none`}></div>
              </>
            )}

            {/* Attachments Display */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {message.attachments.map((att, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-white/10 bg-black/40 p-1 group-hover:border-white/20 transition-colors">
                    {att.mimeType.startsWith('image/') ? (
                      <img src={`data:${att.mimeType};base64,${att.data}`} alt="att" className="h-32 w-auto object-cover rounded-md" />
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-300 h-10 px-3 bg-white/5 rounded-md font-mono">
                        <FileText className="w-4 h-4 text-blue-400" /> <span>{att.name || 'DATA_FILE'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Message Content with Custom Code Rendering */}
            <div className={`prose prose-invert max-w-none leading-relaxed ${isUser ? 'text-gray-100' : 'text-gray-200'}`}>
              <ReactMarkdown 
                components={{
                  code(props) {
                    const {children, className, node, ...rest} = props;
                    const match = /language-(\w+)/.exec(className || '');
                    // If it has a language class or includes newlines, treat as block
                    const isBlock = match || String(children).includes('\n');

                    if (isBlock) {
                      return <CodeBlock {...props} />;
                    }
                    return <code className="bg-white/10 text-rose-300 px-1.5 py-0.5 rounded text-sm font-mono border border-white/10" {...rest}>{children}</code>;
                  }
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>

            {/* Web Sources Grid */}
            {(message.webSources?.length || 0) > 0 && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-3 font-bold flex items-center gap-2 font-mono">
                  <Globe className="w-3 h-3" /> External Data Uplink
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {message.webSources?.map((source, idx) => (
                    <a key={idx} href={source.uri} target="_blank" rel="noreferrer" className={`text-xs bg-white/5 text-gray-300 border border-white/5 p-2 rounded-lg flex items-center justify-between hover:bg-${accentColor}-500/10 hover:border-${accentColor}-500/30 transition-all group/link`}>
                      <span className="truncate flex-1 mr-2">{source.title}</span> 
                      <ExternalLink className={`w-3 h-3 opacity-50 group-hover/link:text-${accentColor}-400`} />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Map Sources Grid */}
            {(message.mapSources?.length || 0) > 0 && (
               <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                 {message.mapSources?.map((map, idx) => (
                   <a key={idx} href={map.uri} target="_blank" rel="noreferrer" className="text-xs bg-white/5 p-3 rounded-lg flex items-center justify-between border border-white/10 hover:border-red-500/50 hover:bg-white/10 transition-all group/map">
                     <span className="truncate text-gray-300 group-hover/map:text-white">{map.title}</span> 
                     <MapPin className="w-3 h-3 text-red-500 group-hover/map:scale-125 transition-transform" />
                   </a>
                 ))}
               </div>
            )}
            
            {/* Error State */}
            {message.isError && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 animate-pulse">
                <Terminal className="w-4 h-4 text-red-400 mt-0.5" />
                <p className="text-red-300 text-xs font-mono">{message.text}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatMessage;
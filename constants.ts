import { AppMode, SafetySetting } from './types';
import { 
  BookOpen, 
  Code2, 
  Feather, 
  MessageSquare 
} from 'lucide-react';

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash';
export const GEMINI_MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: SafetySetting.BLOCK_ONLY_HIGH },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: SafetySetting.BLOCK_ONLY_HIGH },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: SafetySetting.BLOCK_ONLY_HIGH },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: SafetySetting.BLOCK_ONLY_HIGH }
];

export const DEFAULT_SYSTEM_INSTRUCTION = `You are Atom AI, a highly advanced, intelligent, and friendly AI assistant.
You are witty, concise, and extremely knowledgeable.
When in STUDY mode, break down complex topics into simple terms.
When analyzing images, look for text, diagrams, or objects and explain them clearly.`;

export const MODE_CONFIG = {
  [AppMode.GENERAL]: {
    icon: MessageSquare,
    color: 'text-blue-400',
    prompt: "You are a helpful general assistant."
  },
  [AppMode.STUDY]: {
    icon: BookOpen,
    color: 'text-emerald-400',
    prompt: "You are an expert academic tutor. Explain concepts clearly, step-by-step."
  },
  [AppMode.CODING]: {
    icon: Code2,
    color: 'text-purple-400',
    prompt: "You are a senior software engineer. Provide clean, efficient code."
  },
  [AppMode.CREATIVE]: {
    icon: Feather,
    color: 'text-pink-400',
    prompt: "You are a creative writer. Use evocative language."
  }
};
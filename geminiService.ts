import { GoogleGenAI, Modality, GenerateContentResponse, Part, Content } from "@google/genai";
import { Attachment, WebSource, MapSource, Message } from "../types";
import { GEMINI_MODEL_TEXT, GEMINI_MODEL_TTS, SAFETY_SETTINGS } from "../constants";

// --- KEY MANAGEMENT SYSTEM ---

// Load keys from environment
const API_KEYS = [
  process.env.API_KEY_PRIMARY,
  process.env.API_KEY_SECONDARY
].filter(Boolean) as string[];

// State for Key Rotation
let activeKeyIndex = 0;
let primaryKeyRecoveryTimestamp = 0;
// Cooldown: 60 seconds (covers standard RPM limit). 
// If it's a daily limit, it will just fail again and switch back, which is acceptable.
const RECOVERY_COOLDOWN_MS = 60 * 1000; 

const getClient = () => {
  // Check if we can restore the Primary Key (Auto-Switch Back)
  if (activeKeyIndex !== 0 && Date.now() > primaryKeyRecoveryTimestamp) {
    activeKeyIndex = 0;
    console.log("System: Primary Neural Link cooldown complete. Restoring main connection.");
  }

  const apiKey = API_KEYS[activeKeyIndex];
  
  if (!apiKey) {
    throw new Error("Access Denied: No API Keys available.");
  }

  // Check for the placeholder key often copied from tutorials
  if (apiKey.includes("AIzaSyB9vQ3ufExr_YIPwfu-YkKUd_-SsJgIDx4") || apiKey.includes("PASTE_YOUR_KEY_HERE")) {
    throw new Error("SETUP REQUIRED: You are currently using a placeholder API Key. Please open 'vite.config.ts' and replace the keys with your real Gemini API Key.");
  }

  return new GoogleGenAI({ apiKey });
};

interface GenResponse {
  text: string;
  webSources: WebSource[];
  mapSources: MapSource[];
}

// Utility to pause execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper to retry functions on specific error codes
const callWithRetry = async (fn: () => Promise<any>, retries = 3, initialDelay = 2000) => {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error.message?.includes('429') || error.toString().includes('429');
      const isServerIssue = error.message?.includes('503') || error.message?.includes('500');

      if (i === retries - 1) throw error;

      if (isRateLimit || isServerIssue) {
        console.warn(`Gemini Request failed (Attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`);
        await sleep(delay);
        delay *= 2; 
        continue;
      }
      throw error;
    }
  }
};

// Wrapper to handle Key Rotation on Quota Exceeded
const executeWithKeyRotation = async <T>(operation: (ai: GoogleGenAI) => Promise<T>): Promise<T> => {
  try {
    // Try with current key
    const ai = getClient();
    return await operation(ai);
  } catch (error: any) {
    const isQuota = error.message?.includes('429') || error.toString().includes('429');
    
    // If Quota hit AND we are on Primary key AND we have a Backup
    if (isQuota && activeKeyIndex === 0 && API_KEYS.length > 1) {
      console.warn("CRITICAL: Primary Key Quota Exceeded. Engaging Backup Link...");
      
      // Switch to Secondary
      activeKeyIndex = 1;
      // Set cooldown for Primary
      primaryKeyRecoveryTimestamp = Date.now() + RECOVERY_COOLDOWN_MS;
      
      // Retry immediately with Backup Key
      const ai = getClient();
      return await operation(ai);
    }
    
    throw error;
  }
};

export const generateResponse = async (
  prompt: string,
  attachments: Attachment[],
  history: Message[],
  systemInstruction: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<GenResponse> => {
  
  // 1. Format History for Context
  const contents: Content[] = history
    .filter(msg => !msg.isError)
    .map(msg => {
      const parts: Part[] = [];
      if (msg.attachments) {
        msg.attachments.forEach(att => {
          if (att.data && att.mimeType) {
            parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
          }
        });
      }
      if (msg.text) parts.push({ text: msg.text });
      return { role: msg.role, parts: parts };
    })
    .filter(content => content.parts.length > 0); // IMPORTANT: Filter out empty messages to prevent 400 Bad Request

  // 2. Create Current Message Content
  const currentParts: Part[] = [];
  attachments.forEach(att => {
    if (att.data && att.mimeType) {
      currentParts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
    }
  });
  if (prompt) currentParts.push({ text: prompt });
  
  // Ensure current message is not empty (though UI should prevent this)
  if (currentParts.length > 0) {
    contents.push({ role: 'user', parts: currentParts });
  }

  // 3. Construct Config
  const baseConfig: any = {
    systemInstruction: systemInstruction,
    safetySettings: SAFETY_SETTINGS,
  };

  const tools: any[] = [{ googleSearch: {} }];
  let toolConfig: any = undefined;

  if (userLocation) {
    tools.push({ googleMaps: {} });
    toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        }
      }
    };
  }

  const fullConfig = { ...baseConfig, tools, toolConfig };

  // WRAP API CALLS IN ROTATION LOGIC
  return executeWithKeyRotation(async (ai) => {
    try {
      // Attempt 1: Full capabilities
      const response: GenerateContentResponse = await callWithRetry(() => ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: contents,
        config: fullConfig
      }));
      return processResponse(response);
    } catch (error: any) {
      console.warn("Primary generation failed, retrying without tools...", error);
      
      // If the error was 429, executeWithKeyRotation catches it outside.
      // We must re-throw 429 so rotation can handle it.
      if (error.message?.includes('429')) throw error;

      // Attempt 2: Fallback (No tools)
      try {
        const response: GenerateContentResponse = await callWithRetry(() => ai.models.generateContent({
          model: GEMINI_MODEL_TEXT,
          contents: contents,
          config: baseConfig 
        }));
        return processResponse(response);
      } catch (retryError: any) {
        // Final check for 429 to allow rotation bubble-up
        if (retryError.message?.includes('429')) throw retryError;

        let errorMessage = retryError.message || "Unknown error connecting to Neural Core.";
        if (errorMessage.includes("400")) errorMessage = "Invalid Request (400). Please check your API Key in vite.config.ts.";
        if (errorMessage.includes("403")) errorMessage = "Access Key Invalid (403). Please check your API Key in vite.config.ts.";
        if (errorMessage.includes("API key not valid")) errorMessage = "API Key Invalid. Please check vite.config.ts.";
        
        throw new Error(errorMessage);
      }
    }
  });
};

// Helper to extract text and sources
const processResponse = (response: GenerateContentResponse): GenResponse => {
  const text = response.text || "I couldn't generate a response. The model might be busy.";
  const webSources: WebSource[] = [];
  const mapSources: MapSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  chunks.forEach((chunk: any) => {
    if (chunk.web) webSources.push({ uri: chunk.web.uri, title: chunk.web.title });
    if (chunk.maps) mapSources.push({ uri: chunk.maps.uri, title: chunk.maps.title || "View on Maps" });
  });

  return { text, webSources, mapSources };
};

export const speakText = async (text: string, voiceName: string = 'Kore') => {
  try {
    // Also use rotation for TTS
    await executeWithKeyRotation(async (ai) => {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TTS,
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    });
  } catch (error) {
    console.error("TTS Error:", error);
  }
};

import { GoogleGenAI, Modality, GenerateContentResponse, Part, Content } from "@google/genai";
import { Attachment, WebSource, MapSource, Message } from "./types";
import { GEMINI_MODEL_TEXT, GEMINI_MODEL_TTS, SAFETY_SETTINGS } from "./constants";

/**
 * Gemini API Client Initialization
 * Always use the pre-configured process.env.API_KEY directly.
 */
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("System Error: Neural Link unreachable. API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

interface GenResponse {
  text: string;
  webSources: WebSource[];
  mapSources: MapSource[];
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Robust handling for API errors with graceful retry logic.
 */
const callWithRetry = async (fn: () => Promise<any>, retries = 3, initialDelay = 2000) => {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error.message?.includes('429') || error.toString().includes('429');
      if (i === retries - 1) throw error;
      if (isRateLimit) {
        await sleep(delay);
        delay *= 2; 
        continue;
      }
      throw error;
    }
  }
};

/**
 * Generate a response from the Gemini model with optional grounding tools.
 */
export const generateResponse = async (
  prompt: string,
  attachments: Attachment[],
  history: Message[],
  systemInstruction: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<GenResponse> => {
  // 1. Format history for context ensuring non-empty parts
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
    .filter(content => content.parts.length > 0);

  // 2. Format current user message parts
  const currentParts: Part[] = [];
  attachments.forEach(att => {
    if (att.data && att.mimeType) {
      currentParts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
    }
  });
  if (prompt) currentParts.push({ text: prompt });
  if (currentParts.length > 0) contents.push({ role: 'user', parts: currentParts });

  // 3. Define configuration with system instructions and grounding tools
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
        latLng: { latitude: userLocation.latitude, longitude: userLocation.longitude }
      }
    };
  }

  const ai = getClient();
  try {
    // Attempt generation with full capability (grounding tools)
    const response: GenerateContentResponse = await callWithRetry(() => ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: contents,
      config: { ...baseConfig, tools, toolConfig }
    }));
    return processResponse(response);
  } catch (error: any) {
    if (error.message?.includes('429')) throw error;
    
    // Fallback: Attempt generation without specialized tools
    const response: GenerateContentResponse = await callWithRetry(() => ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: contents,
      config: baseConfig 
    }));
    return processResponse(response);
  }
};

/**
 * Extract output text and grounding sources from the response.
 */
const processResponse = (response: GenerateContentResponse): GenResponse => {
  // Use .text property directly as per guidelines
  const text = response.text || "Neural connection interrupted. Please try again.";
  const webSources: WebSource[] = [];
  const mapSources: MapSource[] = [];
  
  // ALWAYS extract URLs from groundingChunks when Google Search or Maps is used
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  chunks.forEach((chunk: any) => {
    if (chunk.web) webSources.push({ uri: chunk.web.uri, title: chunk.web.title });
    if (chunk.maps) mapSources.push({ uri: chunk.maps.uri, title: chunk.maps.title || "View on Maps" });
  });

  return { text, webSources, mapSources };
};

/**
 * Generate speech from text using the dedicated TTS model.
 */
export const speakText = async (text: string, voiceName: string = 'Kore') => {
  try {
    const ai = getClient();
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
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    // Decode raw PCM audio data returned by the API
    const audioContext = new AudioContextClass({ sampleRate: 24000 });
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    
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
  } catch (error) { 
    console.error("Audio Synthesis Error:", error); 
  }
};

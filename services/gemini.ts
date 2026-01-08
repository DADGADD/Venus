import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";

const getSafeApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch {
    return '';
  }
};

// Audio Encoding & Decoding Utilities as per instructions
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: getSafeApiKey() });
};

export const chatWithGemini = async (prompt: string, imageBase64?: string) => {
  const ai = getGeminiClient();
  const parts: any[] = [{ text: prompt }];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: imageBase64.split(',')[1],
      },
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
  });

  return {
    text: response.text || "No response received.",
  };
};

export const searchGrounding = async (prompt: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => chunk.web)
    .filter(Boolean) || [];

  return {
    text: response.text || "No response received.",
    links: links.map((l: any) => ({ title: l.title, uri: l.uri })),
  };
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1") => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio,
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image");
};

export const startVideoGeneration = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: getSafeApiKey() });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });
  return operation;
};

export const pollVideoOperation = async (operation: any) => {
  const ai = new GoogleGenAI({ apiKey: getSafeApiKey() });
  return await ai.operations.getVideosOperation({ operation });
};
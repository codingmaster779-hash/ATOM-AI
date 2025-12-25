export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Attachment {
  data: string; // Base64
  mimeType: string;
  name?: string;
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface MapSource {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  attachments?: Attachment[];
  isError?: boolean;
  webSources?: WebSource[];
  mapSources?: MapSource[];
}

export type FontSize = 'small' | 'normal' | 'large';

export interface AppSettings {
  useTTS: boolean;
  themeColor: string;
  userName: string;
  voice: string;
  background: string;
  fontSize: FontSize;
  showParticles: boolean;
}

export enum AppMode {
  GENERAL = 'General Helper',
  STUDY = 'Study Partner',
  CODING = 'Coding Assistant',
  CREATIVE = 'Creative Writer'
}

export enum SafetySetting {
  BLOCK_NONE = 'BLOCK_NONE',
  BLOCK_ONLY_HIGH = 'BLOCK_ONLY_HIGH',
  BLOCK_MEDIUM_AND_ABOVE = 'BLOCK_MEDIUM_AND_ABOVE',
  BLOCK_LOW_AND_ABOVE = 'BLOCK_LOW_AND_ABOVE'
}
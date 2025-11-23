export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  description: string;
  createdAt: number;
  icon?: string; // Optional icon name
}

export interface ChatState {
  [lessonId: string]: Message[];
}

export enum ModelType {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview'
}
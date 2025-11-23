import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, Lesson, ModelType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createChatStream = async (
  lesson: Lesson,
  history: Message[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<string> => {
  
  // Convert internal message format to Gemini API history format
  const apiHistory: Content[] = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text } as Part],
  }));

  // System instruction to ground the AI in the specific lesson context
  const systemInstruction = `
    You are an expert AI tutor assisting a student with a specific lesson.
    
    LESSON DETAILS:
    - Title: ${lesson.title}
    - Subject: ${lesson.subject}
    - Context/Description: ${lesson.description}

    YOUR GOAL:
    - Provide clear, concise, and educational explanations.
    - Use formatting (Markdown) to make complex topics easy to read.
    - If the user asks a question outside the scope of this lesson, gently steer them back or answer briefly before returning to the topic.
    - Be encouraging and patient.
  `;

  try {
    const chat = ai.chats.create({
      model: ModelType.FLASH,
      history: apiHistory,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const resultStream = await chat.sendMessageStream({ message: newMessage });

    let fullText = '';
    for await (const chunk of resultStream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(text);
      }
    }
    return fullText;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate response");
  }
};
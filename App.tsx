import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { NewLessonModal } from './components/NewLessonModal';
import { Lesson, Message, ChatState } from './types';
import { createChatStream } from './services/gemini';

// Helper to generate simple IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const App: React.FC = () => {
  // --- State ---
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('educhat_lessons');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<ChatState>(() => {
    const saved = localStorage.getItem('educhat_messages');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('educhat_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('educhat_messages', JSON.stringify(messages));
  }, [messages]);

  // --- Derived State ---
  const activeLesson = lessons.find(l => l.id === activeLessonId);
  const currentMessages = activeLessonId ? (messages[activeLessonId] || []) : [];

  // --- Handlers ---
  
  const handleCreateLesson = (lesson: Lesson) => {
    setLessons(prev => [lesson, ...prev]); // Add to top
    setMessages(prev => ({ ...prev, [lesson.id]: [] }));
    setActiveLessonId(lesson.id);
    setIsSidebarOpen(false); // Close sidebar on mobile after creation
  };

  const handleDeleteLesson = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this lesson and its chat history?")) {
      setLessons(prev => prev.filter(l => l.id !== id));
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[id];
        return newMessages;
      });
      if (activeLessonId === id) {
        setActiveLessonId(null);
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!activeLessonId || !activeLesson || isStreaming) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
    };

    // Optimistic update
    setMessages(prev => ({
      ...prev,
      [activeLessonId]: [...(prev[activeLessonId] || []), userMessage]
    }));

    setIsStreaming(true);

    // Create a placeholder for the bot message
    const botMessageId = generateId();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      role: 'model',
      text: '', // Starts empty
      timestamp: Date.now(),
    };

    setMessages(prev => ({
      ...prev,
      [activeLessonId]: [...(prev[activeLessonId] || []), botMessagePlaceholder]
    }));

    try {
      // We use currentMessages (before update) + userMessage for history context
      const historyContext = [...currentMessages, userMessage];
      
      // Exclude the very last placeholder we just added from history context passed to API
      const apiHistory = historyContext.slice(0, historyContext.length); 

      await createChatStream(
        activeLesson,
        currentMessages, // Pass the history *before* the new user message for correct SDK usage, OR handle inside service. 
        // Actually, standard pattern is: History contains everything UP TO the current user prompt.
        // But the SDK `sendMessage` takes the new prompt. 
        // So `history` should match the `messages` state minus the current user prompt.
        // Let's fix the service call logic in `createChatStream`.
        // Actually, easiest is to pass `currentMessages` (which is previous history) 
        // and let the service construct the chat.
        text,
        (chunk) => {
          setMessages(prev => {
            const lessonMessages = prev[activeLessonId] || [];
            const updatedMessages = lessonMessages.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, text: msg.text + chunk }
                : msg
            );
            return { ...prev, [activeLessonId]: updatedMessages };
          });
        }
      );

    } catch (error) {
      setMessages(prev => {
        const lessonMessages = prev[activeLessonId] || [];
        const updatedMessages = lessonMessages.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, isError: true, text: "Sorry, I encountered an error processing your request." }
            : msg
        );
        return { ...prev, [activeLessonId]: updatedMessages };
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar 
        lessons={lessons}
        activeLessonId={activeLessonId}
        onSelectLesson={(id) => {
          setActiveLessonId(id);
          setIsSidebarOpen(false); // Close sidebar on mobile selection
        }}
        onAddLesson={() => setIsModalOpen(true)}
        onDeleteLesson={handleDeleteLesson}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <ChatWindow 
          activeLesson={activeLesson}
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          isLoading={isStreaming}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </main>

      <NewLessonModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateLesson}
      />
    </div>
  );
};

export default App;
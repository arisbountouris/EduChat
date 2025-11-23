import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, AlertCircle, Loader2, Menu, Sparkles, FileText, Layers, BrainCircuit, ChevronDown } from 'lucide-react';
import { Message, Lesson } from '../types';

interface ChatWindowProps {
  activeLesson: Lesson | undefined;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  toggleSidebar: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  activeLesson,
  messages,
  onSendMessage,
  isLoading,
  toggleSidebar
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      // Reset height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleToolSelect = (type: 'summary' | 'flashcards' | 'quiz') => {
    if (isLoading) return;
    setIsToolsOpen(false);
    
    let text = "";
    switch (type) {
      case 'summary':
        text = "Please provide a concise but comprehensive summary of the key points for this lesson.";
        break;
      case 'flashcards':
        text = "Create a set of 5-10 study flashcards for this lesson. Format them clearly as 'Term: Definition'.";
        break;
      case 'quiz':
        text = "Generate 3 practice questions to test my understanding of this lesson. List the questions first, then provide the answers at the end.";
        break;
    }
    
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-grow textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  if (!activeLesson) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center p-8 max-w-md">
          <div className="bg-orange-100 p-4 rounded-full inline-flex mb-6">
            <Bot size={48} className="text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to EduChat</h2>
          <p className="text-slate-500 mb-8">Select a lesson from the sidebar or create a new one to start your personalized tutoring session.</p>
          <button 
            onClick={toggleSidebar}
            className="lg:hidden bg-orange-600 text-white px-6 py-2 rounded-full font-medium"
          >
            View Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-200 flex items-center gap-4 bg-white z-10 sticky top-0">
        <button onClick={toggleSidebar} className="lg:hidden text-slate-500 hover:text-slate-700">
          <Menu size={24} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-none truncate">{activeLesson.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full uppercase tracking-wide shrink-0">
              {activeLesson.subject}
            </span>
          </div>
        </div>

        {/* Study Tools Dropdown */}
        <div className="relative" ref={toolsRef}>
          <button
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            disabled={isLoading}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${isToolsOpen 
                ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-100' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-orange-200'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Sparkles size={16} className={isToolsOpen ? 'text-orange-600' : 'text-amber-500'} />
            <span className="hidden sm:inline">Study Tools</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
          </button>

          {isToolsOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
               <div className="px-3 py-2 border-b border-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                 Generate Content
               </div>
               
               <button 
                 onClick={() => handleToolSelect('summary')}
                 className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-orange-600 flex items-center gap-3 transition-colors"
               >
                 <FileText size={16} className="text-slate-400" />
                 Lesson Summary
               </button>

               <button 
                 onClick={() => handleToolSelect('flashcards')}
                 className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-orange-600 flex items-center gap-3 transition-colors"
               >
                 <Layers size={16} className="text-slate-400" />
                 Create Flashcards
               </button>

               <button 
                 onClick={() => handleToolSelect('quiz')}
                 className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-orange-600 flex items-center gap-3 transition-colors"
               >
                 <BrainCircuit size={16} className="text-slate-400" />
                 Practice Quiz
               </button>
            </div>
          )}
        </div>
      </header>

      {/* Messages Area - Full Width "ChatGPT Style" */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 opacity-60">
             <div className="bg-orange-100 p-4 rounded-full">
                <Bot size={40} className="text-orange-600" />
             </div>
             <p className="text-base font-medium text-slate-600">Start a new session about {activeLesson.title}</p>
          </div>
        )}
        
        <div className="flex flex-col pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`
                w-full border-b border-black/5 py-8
                ${msg.role === 'model' ? 'bg-orange-50/40' : 'bg-white'}
              `}
            >
              <div className="max-w-3xl mx-auto px-4 md:px-6 flex gap-6">
                {/* Avatar Column */}
                <div className="shrink-0 flex flex-col relative items-end">
                  <div className={`
                    w-8 h-8 rounded-md flex items-center justify-center shadow-sm
                    ${msg.role === 'user' ? 'bg-slate-700' : 'bg-orange-600'}
                  `}>
                    {msg.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
                  </div>
                </div>

                {/* Content Column */}
                <div className="relative flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 mb-1 select-none">
                    {msg.role === 'user' ? 'You' : 'EduChat AI'}
                  </div>

                  {msg.isError ? (
                     <div className="mt-1 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 flex items-center gap-2 text-sm">
                       <AlertCircle size={16} />
                       <span>{msg.text}</span>
                     </div>
                  ) : (
                    <div className="prose prose-slate prose-sm md:prose-base max-w-none text-slate-800 prose-headings:font-semibold prose-a:text-orange-600 prose-strong:text-slate-900 prose-pre:bg-slate-900 prose-pre:rounded-lg">
                      <ReactMarkdown
                         components={{
                            // Custom pre for better scrolling code blocks
                            pre: ({node, ...props}) => (
                                <div className="overflow-auto w-full my-4 rounded-lg bg-slate-900 border border-slate-800">
                                    <pre {...props} className="p-4 m-0 bg-transparent text-sm leading-relaxed text-slate-100" />
                                </div>
                            ),
                            // Custom code for inline code snippets
                            code: ({node, className, ...props}) => {
                                const match = /language-(\w+)/.exec(className || '')
                                const isInline = !match && !String(props.children).includes('\n')
                                return isInline ? (
                                    <code className="bg-slate-100 text-orange-700 px-1.5 py-0.5 rounded text-sm font-medium font-mono" {...props} />
                                ) : (
                                    <code className="bg-transparent text-inherit font-mono" {...props} />
                                )
                            }
                         }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask your question..."
            rows={1}
            className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl pl-4 pr-12 py-3.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none min-h-[52px] max-h-[200px]"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className={`
              absolute right-2 bottom-2.5 p-2 rounded-lg transition-all
              ${inputValue.trim() && !isLoading 
                ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <div className="text-center mt-2 text-xs text-slate-400">
          EduChat can make mistakes. Consider checking important information.
        </div>
      </div>
    </div>
  );
};
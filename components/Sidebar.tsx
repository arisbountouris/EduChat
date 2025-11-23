import React from 'react';
import { BookOpen, Plus, Trash2, MessageSquare, GraduationCap, Search } from 'lucide-react';
import { Lesson } from '../types';

interface SidebarProps {
  lessons: Lesson[];
  activeLessonId: string | null;
  onSelectLesson: (id: string) => void;
  onAddLesson: () => void;
  onDeleteLesson: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  lessons,
  activeLessonId,
  onSelectLesson,
  onAddLesson,
  onDeleteLesson,
  isOpen,
  toggleSidebar
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredLessons = lessons.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group lessons by subject for better organization
  const lessonsBySubject = filteredLessons.reduce((acc, lesson) => {
    if (!acc[lesson.subject]) acc[lesson.subject] = [];
    acc[lesson.subject].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Content */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-72 bg-[#1A120B] text-orange-50 flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">EduChat</h1>
            <p className="text-xs text-orange-200/60">Your AI Study Buddy</p>
          </div>
        </div>

        <div className="p-4 pb-2">
          <button
            onClick={onAddLesson}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-lg shadow-orange-900/20"
          >
            <Plus size={18} />
            New Lesson
          </button>
        </div>

        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-200/40" size={14} />
            <input 
              type="text" 
              placeholder="Search lessons..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 text-orange-50 pl-9 pr-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder-orange-200/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.keys(lessonsBySubject).length === 0 ? (
            <div className="text-center text-orange-200/30 mt-10">
              <BookOpen className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm">No lessons found.</p>
              <p className="text-xs">Create one to get started!</p>
            </div>
          ) : (
            Object.entries(lessonsBySubject).map(([subject, subjectLessons]) => (
              <div key={subject}>
                <h3 className="text-xs font-semibold text-orange-200/40 uppercase tracking-wider mb-3 px-2">
                  {subject}
                </h3>
                <div className="space-y-1">
                  {(subjectLessons as Lesson[]).map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson.id)}
                      className={`
                        group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all
                        ${activeLessonId === lesson.id 
                          ? 'bg-white/10 text-orange-400 shadow-sm' 
                          : 'text-orange-100/70 hover:bg-white/5 hover:text-orange-50'
                        }
                      `}
                    >
                      <MessageSquare size={16} className={activeLessonId === lesson.id ? 'text-orange-400' : 'text-orange-200/30 group-hover:text-orange-200/50'} />
                      <span className="truncate text-sm font-medium flex-1">{lesson.title}</span>
                      
                      <button
                        onClick={(e) => onDeleteLesson(lesson.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-orange-200/40 hover:text-red-400 transition-opacity p-1 rounded hover:bg-white/10"
                        title="Delete lesson"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/10 text-xs text-orange-200/30 text-center">
          Powered by Google Gemini
        </div>
      </aside>
    </>
  );
};
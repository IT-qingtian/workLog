import React, { useState, useRef, useEffect } from 'react';
import { EntryForm } from './components/EntryForm';
import { LogList } from './components/LogList.tsx';
import { SearchBar } from './components/SearchBar';
import { DataTransfer } from './components/DataTransfer';
import { NotebookPen, Sparkles, Edit2, Check } from 'lucide-react';
import { useWorkLogStore } from './store/useWorkLogStore';

function App() {
  const { appTitle, setAppTitle } = useWorkLogStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(appTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempTitle(appTitle);
  }, [appTitle]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const handleTitleSave = () => {
    if (tempTitle.trim()) {
      setAppTitle(tempTitle.trim());
    } else {
      setTempTitle(appTitle); // Revert if empty
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTempTitle(appTitle);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 group shrink-0">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-all duration-300 group-hover:scale-105">
              <NotebookPen size={20} strokeWidth={2.5} />
            </div>
            <div className="relative">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleKeyDown}
                    className="text-xl font-bold text-slate-800 tracking-tight bg-white border border-indigo-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-w-[200px]"
                  />
                  <button 
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                    onClick={handleTitleSave}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <div 
                  className="flex items-center gap-2 group/title cursor-pointer"
                  onClick={() => setIsEditingTitle(true)}
                  title="点击修改标题"
                >
                  <h1 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {appTitle}
                  </h1>
                  <Edit2 size={14} className="text-slate-300 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                </div>
              )}
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider hidden sm:block">
                Daily Work Tracker
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-1 justify-end max-w-2xl">
            <div className="hidden md:block w-full max-w-md">
              <SearchBar />
            </div>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <DataTransfer />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Entry Form */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black/5 rounded-full blur-xl"></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-300" />
                    开始记录
                  </h3>
                  <p className="text-indigo-100 text-sm opacity-90">
                    记录今天的每一个进步。
                  </p>
                </div>
              </div>
              <EntryForm />
            </div>
          </div>

          {/* Main Content - Log List */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <div className="md:hidden mb-6">
              <SearchBar />
            </div>
            
            <div className="flex items-center justify-between mb-2 px-1">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">最近日志</h2>
                <p className="text-slate-500 text-sm mt-1">查看和管理您的工作记录</p>
              </div>
            </div>
            
            <LogList />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

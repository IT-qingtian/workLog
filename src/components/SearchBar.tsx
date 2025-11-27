import React from 'react';
import { Search } from 'lucide-react';
import { useWorkLogStore } from '../store/useWorkLogStore';

export const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useWorkLogStore();

  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white sm:text-sm transition-all shadow-sm hover:border-indigo-200"
        placeholder="搜索需求、仓库、分支..."
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 hidden sm:block">⌘K</span>
      </div>
    </div>
  );
};

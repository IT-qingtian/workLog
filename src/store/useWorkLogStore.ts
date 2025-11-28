import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkLog, WorkLogFormData, TaskStatus } from '../types/workLog';
import { v4 as uuidv4 } from 'uuid';

interface WorkLogState {
  logs: WorkLog[];
  repositories: string[];
  searchQuery: string;
  filterStatus: TaskStatus | 'all';
  filterRepo: string | 'all';
  sortBy: 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
  editingLogId: string | null;
  appTitle: string;
  
  addLog: (data: WorkLogFormData) => void;
  updateLog: (id: string, data: Partial<WorkLogFormData>) => void;
  deleteLog: (id: string) => void;
  importLogs: (newLogs: WorkLog[]) => void;
  
  addRepository: (name: string) => void;
  deleteRepository: (name: string) => void;
  
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: TaskStatus | 'all') => void;
  setFilterRepo: (repo: string | 'all') => void;
  setSortBy: (sortBy: 'createdAt' | 'updatedAt') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setEditingLogId: (id: string | null) => void;
  setAppTitle: (title: string) => void;
  
  getFilteredLogs: () => WorkLog[];
}

export const useWorkLogStore = create<WorkLogState>()(
  persist(
    (set, get) => ({
      logs: [],
      repositories: ['frontend-repo', 'backend-repo', 'mobile-app'], // Default repos
      searchQuery: '',
      filterStatus: 'all',
      filterRepo: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      editingLogId: null,
      appTitle: '工作日志 Pro',
      
      addLog: (data) => {
        const newLog: WorkLog = {
          ...data,
          id: uuidv4(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({ logs: [newLog, ...state.logs] }));
      },

      updateLog: (id, data) => {
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id
              ? { ...log, ...data, updatedAt: Date.now() }
              : log
          ),
          editingLogId: null, // Exit edit mode after update
        }));
      },

      deleteLog: (id) => {
        set((state) => ({
          logs: state.logs.filter((log) => log.id !== id),
          editingLogId: state.editingLogId === id ? null : state.editingLogId,
        }));
      },

      importLogs: (newLogs) => {
        set((state) => {
          const existingIds = new Set(state.logs.map(l => l.id));
          const uniqueNewLogs = newLogs.filter(l => !existingIds.has(l.id));
          
          return {
            logs: [...uniqueNewLogs, ...state.logs]
          };
        });
      },

      addRepository: (name) => {
        set((state) => {
          if (state.repositories.includes(name)) return state;
          return { repositories: [...state.repositories, name] };
        });
      },

      deleteRepository: (name) => {
        set((state) => ({
          repositories: state.repositories.filter((r) => r !== name),
        }));
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterStatus: (status) => set({ filterStatus: status }),
      setFilterRepo: (repo) => set({ filterRepo: repo }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setEditingLogId: (id) => set({ editingLogId: id }),
      setAppTitle: (title) => set({ appTitle: title }),

      getFilteredLogs: () => {
        const { logs, searchQuery, filterStatus, filterRepo, sortBy, sortOrder } = get();
        
        const filtered = logs.filter((log) => {
          const lowerQuery = searchQuery.toLowerCase();
          const matchesSearch =
            !searchQuery.trim() ||
            log.requirement.toLowerCase().includes(lowerQuery) ||
            log.yunxiaoId.toLowerCase().includes(lowerQuery) ||
            (log.note && log.note.toLowerCase().includes(lowerQuery)) ||
            log.repoBranches.some(
              (rb) =>
                rb.repository.toLowerCase().includes(lowerQuery) ||
                rb.branch.toLowerCase().includes(lowerQuery)
            );

          const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
          const matchesRepo = filterRepo === 'all' || log.repoBranches.some(rb => rb.repository === filterRepo);

          return matchesSearch && matchesStatus && matchesRepo;
        });

        return filtered.sort((a, b) => {
          const diff = (a[sortBy] as number) - (b[sortBy] as number);
          return sortOrder === 'desc' ? -diff : diff;
        });
      },
    }),
    {
      name: 'work-log-storage',
      partialize: (state) => ({ 
        logs: state.logs, 
        repositories: state.repositories,
        appTitle: state.appTitle 
      }),
    }
  )
);

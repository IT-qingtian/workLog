import React from 'react';
import { GitBranch, ExternalLink, Calendar, Trash2, Filter, Search, Copy, Check, StickyNote, Edit2 } from 'lucide-react';
import { useWorkLogStore } from '../store/useWorkLogStore';
import { TaskStatus } from '../types/workLog';
import { motion, AnimatePresence } from 'framer-motion';
import { Select } from './ui/Select';
import { useCopyToClipboard } from 'react-use';

const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const styles = {
    development: 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20',
    testing: 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20',
    staging: 'bg-violet-50 text-violet-700 border-violet-100 ring-violet-500/20',
    released: 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20',
  };

  const dots = {
    development: 'bg-blue-500',
    testing: 'bg-amber-500',
    staging: 'bg-violet-500',
    released: 'bg-emerald-500',
  };

  const labels = {
    development: '开发中',
    testing: '测试中',
    staging: '亚测中',
    released: '已上线',
  };

  return (
    <span className={`pl-2 pr-2.5 py-1 rounded-full text-xs font-medium border ring-1 ring-inset flex items-center gap-1.5 ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`}></span>
      {labels[status]}
    </span>
  );
};

export const LogList: React.FC = () => {
  const { 
    getFilteredLogs, 
    deleteLog, 
    filterStatus, 
    setFilterStatus, 
    filterRepo, 
    setFilterRepo,
    repositories,
    setEditingLogId,
    editingLogId
  } = useWorkLogStore();
  
  const logs = getFilteredLogs();
  const [state, copyToClipboard] = useCopyToClipboard();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (log: any) => {
    const text = `需求: ${log.requirement}\n状态: ${log.status}\n云效: ${log.yunxiaoId || '无'}\n${log.note ? `备注: ${log.note}\n` : ''}仓库:\n${log.repoBranches.map((rb: any) => `- ${rb.repository}: ${rb.branch}`).join('\n')}`;
    copyToClipboard(text);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (id: string) => {
    setEditingLogId(id);
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const statusOptions = [
    { value: 'all', label: '所有状态' },
    { value: 'development', label: '开发中' },
    { value: 'testing', label: '测试中' },
    { value: 'staging', label: '亚测中' },
    { value: 'released', label: '已上线' },
  ];

  const repoOptions = [
    { value: 'all', label: '所有仓库' },
    ...repositories.map(repo => ({ value: repo, label: repo }))
  ];

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex flex-wrap gap-2 items-center shadow-sm">
        <div className="px-3 py-1.5 flex items-center gap-2 text-slate-500 text-sm font-medium border-r border-slate-100">
          <Filter size={16} className="text-indigo-500" />
          <span>筛选</span>
        </div>
        
        <div className="w-40">
          <Select
            value={filterStatus}
            onChange={(val) => setFilterStatus(val as TaskStatus | 'all')}
            options={statusOptions}
            className="w-full"
          />
        </div>

        <div className="w-px h-6 bg-slate-100"></div>

        <div className="w-48">
          <Select
            value={filterRepo}
            onChange={(val) => setFilterRepo(val)}
            options={repoOptions}
            className="w-full"
          />
        </div>
      </div>

      {/* List Content */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {logs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-300" size={32} />
              </div>
              <h3 className="text-slate-900 font-medium mb-1">暂无日志</h3>
              <p className="text-slate-500 text-sm">开始添加一条新记录吧！</p>
            </motion.div>
          ) : (
            logs.map((log) => (
              <motion.div 
                key={log.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white p-6 rounded-2xl shadow-sm border transition-all group relative overflow-hidden ${editingLogId === log.id ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-100 hover:shadow-md hover:border-indigo-100'}`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full transition-opacity ${editingLogId === log.id ? 'bg-indigo-500 opacity-100' : 'bg-indigo-500 opacity-0 group-hover:opacity-100'}`}></div>
                
                <div className="flex justify-between items-start mb-4 pl-2">
                  <div className="space-y-2 flex-1 mr-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-800 leading-tight">{log.requirement}</h3>
                      <StatusBadge status={log.status} />
                      {editingLogId === log.id && (
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded animate-pulse">
                          正在编辑...
                        </span>
                      )}
                    </div>
                    
                    {log.note && (
                      <div className="flex items-start gap-2 text-sm text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                        <StickyNote size={14} className="text-amber-400 mt-0.5 shrink-0" />
                        <p className="whitespace-pre-wrap">{log.note}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                      {log.yunxiaoId && (
                        <a
                          href={`https://devops.aliyun.com/projex/req/${log.yunxiaoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-all border border-indigo-100 group/link"
                        >
                          <ExternalLink size={14} className="group-hover/link:scale-110 transition-transform" />
                          <span className="font-mono font-semibold text-xs tracking-wide">#{log.yunxiaoId}</span>
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(log.id)}
                      className={`p-2 rounded-lg transition-all ${editingLogId === log.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                      title="编辑日志"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleCopy(log)}
                      className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all relative"
                      title="复制日志"
                    >
                      {copiedId === log.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                      title="删除日志"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {log.repoBranches.length > 0 && (
                  <div className="mt-5 pl-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {log.repoBranches.map((rb) => (
                        <div key={rb.id} className="flex items-center gap-3 text-sm bg-slate-50/80 p-3 rounded-xl border border-slate-100 group-hover:bg-slate-50 transition-colors">
                          <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">
                            <GitBranch size={14} className="text-indigo-500" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-700 truncate">{rb.repository}</span>
                            <span className="text-xs text-slate-500 font-mono truncate bg-slate-200/50 px-1.5 py-0.5 rounded w-fit mt-0.5">
                              {rb.branch}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

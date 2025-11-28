import React, { useState, useEffect } from 'react';
import { Plus, X, Settings, GitBranch, Link2, FileText, Activity, StickyNote, AlertCircle, Save, RotateCcw } from 'lucide-react';
import { useWorkLogStore } from '../store/useWorkLogStore';
import { RepoBranch, TaskStatus } from '../types/workLog';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { Select } from './ui/Select';

export const EntryForm: React.FC = () => {
  const { 
    addLog, 
    updateLog, 
    repositories, 
    addRepository, 
    deleteRepository, 
    editingLogId, 
    logs, 
    setEditingLogId 
  } = useWorkLogStore();
  
  const [requirement, setRequirement] = useState('');
  const [note, setNote] = useState('');
  const [yunxiaoId, setYunxiaoId] = useState('');
  const [status, setStatus] = useState<TaskStatus>('development');
  const [repoBranches, setRepoBranches] = useState<RepoBranch[]>([
    { id: uuidv4(), repository: '', branch: '' }
  ]);
  
  const [newRepoName, setNewRepoName] = useState('');
  const [showRepoManager, setShowRepoManager] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Populate form when editingLogId changes
  useEffect(() => {
    if (editingLogId) {
      const logToEdit = logs.find(log => log.id === editingLogId);
      if (logToEdit) {
        setRequirement(logToEdit.requirement);
        setNote(logToEdit.note || '');
        setYunxiaoId(logToEdit.yunxiaoId);
        setStatus(logToEdit.status);
        setRepoBranches(logToEdit.repoBranches.length > 0 
          ? logToEdit.repoBranches 
          : [{ id: uuidv4(), repository: '', branch: '' }]
        );
        setErrors({});
      }
    } else {
      resetForm();
    }
  }, [editingLogId, logs]);

  const resetForm = () => {
    setRequirement('');
    setNote('');
    setYunxiaoId('');
    setStatus('development');
    setRepoBranches([{ id: uuidv4(), repository: '', branch: '' }]);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    resetForm();
  };

  const handleAddRepoBranch = () => {
    setRepoBranches([...repoBranches, { id: uuidv4(), repository: '', branch: '' }]);
  };

  const handleRemoveRepoBranch = (id: string) => {
    if (repoBranches.length > 1) {
      setRepoBranches(repoBranches.filter(rb => rb.id !== id));
    }
  };

  const handleRepoBranchChange = (id: string, field: 'repository' | 'branch', value: string) => {
    setRepoBranches(repoBranches.map(rb => 
      rb.id === id ? { ...rb, [field]: value } : rb
    ));
    // Clear error if user starts typing
    if (errors[`repo-${id}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`repo-${id}`];
        return newErrors;
      });
    }
  };

  const handleAddCustomRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRepoName.trim()) {
      addRepository(newRepoName.trim());
      setNewRepoName('');
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!requirement.trim()) {
      newErrors.requirement = '需求描述不能为空';
      isValid = false;
    }

    // Validate Repo Branches if any are partially filled
    // Or enforce that if a row exists, repo must be selected
    repoBranches.forEach((rb, index) => {
      // If it's the only row and empty, it's fine (we filter it out later), 
      // UNLESS we want to enforce at least one repo? 
      // Let's assume repos are optional, BUT if you select a repo, branch is recommended?
      // Or if you type a branch, repo is required.
      
      if (rb.branch.trim() && !rb.repository) {
        newErrors[`repo-${rb.id}`] = '请选择仓库';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const validRepoBranches = repoBranches.filter(rb => rb.repository.trim() || rb.branch.trim());
    
    const logData = {
      requirement,
      note,
      yunxiaoId,
      status,
      repoBranches: validRepoBranches
    };

    if (editingLogId) {
      updateLog(editingLogId, logData);
    } else {
      addLog(logData);
    }

    if (!editingLogId) {
      resetForm();
    }
  };

  const getAvailableRepos = (currentRepoId: string) => {
    const selectedRepos = repoBranches
      .filter(rb => rb.id !== currentRepoId && rb.repository)
      .map(rb => rb.repository);
    
    return repositories.filter(repo => !selectedRepos.includes(repo));
  };

  const statusOptions = [
    { value: 'development', label: '开发中' },
    { value: 'testing', label: '测试中' },
    { value: 'staging', label: '亚测中' },
    { value: 'released', label: '已上线' },
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-colors ${editingLogId ? 'border-indigo-200 ring-2 ring-indigo-500/10' : 'border-slate-100'}`}>
      <div className={`p-5 border-b flex justify-between items-center ${editingLogId ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50/50 border-slate-50'}`}>
        <h2 className={`font-semibold flex items-center gap-2 ${editingLogId ? 'text-indigo-700' : 'text-slate-800'}`}>
          {editingLogId ? <Save size={18} /> : <FileText size={18} className="text-indigo-500" />}
          {editingLogId ? '编辑日志' : '新增日志'}
        </h2>
        <div className="flex items-center gap-2">
          {editingLogId && (
            <button
              onClick={handleCancelEdit}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <RotateCcw size={12} /> 取消
            </button>
          )}
          <button 
            onClick={() => setShowRepoManager(!showRepoManager)}
            className={`p-2 rounded-lg transition-all ${showRepoManager ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            title="管理仓库列表"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showRepoManager && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50 border-b border-slate-100 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">自定义仓库管理</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="输入新仓库名称"
                />
                <button
                  onClick={handleAddCustomRepo}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                >
                  添加
                </button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                {repositories.map(repo => (
                  <span key={repo} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 shadow-sm">
                    {repo}
                    <button onClick={() => deleteRepository(repo)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              需求描述 <span className="text-red-500">*</span>
            </label>
            {errors.requirement && (
              <span className="text-xs text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-left-1">
                <AlertCircle size={12} /> {errors.requirement}
              </span>
            )}
          </div>
          <textarea
            value={requirement}
            onChange={(e) => {
              setRequirement(e.target.value);
              if (errors.requirement) setErrors({ ...errors, requirement: '' });
            }}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none h-20 text-sm ${errors.requirement ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-indigo-500'}`}
            placeholder="今天完成了什么工作..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">备注 (可选)</label>
          <div className="relative group">
            <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <StickyNote size={16} />
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none h-16 text-sm"
              placeholder="添加额外说明、注意事项等..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">云效 ID</label>
            <div className="relative group">
              <div className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Link2 size={16} />
              </div>
              <input
                type="text"
                value={yunxiaoId}
                onChange={(e) => setYunxiaoId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
                placeholder="123456"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</label>
            <Select
              value={status}
              onChange={(val) => setStatus(val as TaskStatus)}
              options={statusOptions}
              icon={<Activity size={16} />}
            />
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">仓库与分支</label>
            <button
              type="button"
              onClick={handleAddRepoBranch}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
            >
              <Plus size={14} /> 添加仓库
            </button>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {repoBranches.map((rb, index) => (
                <motion.div 
                  key={rb.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-1"
                >
                  <div className="flex gap-2 items-start group">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Select
                        value={rb.repository}
                        onChange={(val) => handleRepoBranchChange(rb.id, 'repository', val)}
                        options={[
                          ...(rb.repository ? [{ value: rb.repository, label: rb.repository }] : []),
                          ...getAvailableRepos(rb.id).map(r => ({ value: r, label: r }))
                        ].sort((a, b) => a.label.localeCompare(b.label))}
                        placeholder="选择仓库..."
                        className={`w-full ${errors[`repo-${rb.id}`] ? 'ring-1 ring-red-300 rounded-xl' : ''}`}
                      />
                      
                      <div className="relative">
                        <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                          <GitBranch size={14} />
                        </div>
                        <input
                          type="text"
                          value={rb.branch}
                          onChange={(e) => handleRepoBranchChange(rb.id, 'branch', e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all hover:border-indigo-300"
                          placeholder="分支名称"
                        />
                      </div>
                    </div>
                    {repoBranches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRepoBranch(rb.id)}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  {errors[`repo-${rb.id}`] && (
                    <span className="text-xs text-red-500 ml-1">{errors[`repo-${rb.id}`]}</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full font-semibold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${
            editingLogId 
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-orange-200 hover:shadow-orange-300'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-200 hover:shadow-indigo-300'
          }`}
        >
          {editingLogId ? <Save size={18} /> : <Plus size={18} />}
          {editingLogId ? '保存修改' : '添加日志'}
        </button>
      </form>
    </div>
  );
};

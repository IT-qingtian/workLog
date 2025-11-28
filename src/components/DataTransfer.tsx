import React, { useRef, useState } from 'react';
import { Download, Upload, FileJson, AlertCircle, Check } from 'lucide-react';
import { useWorkLogStore } from '../store/useWorkLogStore';
import { WorkLog } from '../../types/workLog';
import { motion, AnimatePresence } from 'framer-motion';

export const DataTransfer: React.FC = () => {
  const { logs, importLogs } = useWorkLogStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `work-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showMessage('success', '日志导出成功！');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedLogs = JSON.parse(content);
        
        if (!Array.isArray(parsedLogs)) {
          throw new Error('Invalid format');
        }

        // Basic validation
        const validLogs = parsedLogs.filter((log: any) => 
          log.id && log.requirement && log.status && log.createdAt
        ) as WorkLog[];

        if (validLogs.length === 0) {
          throw new Error('No valid logs found');
        }

        importLogs(validLogs);
        showMessage('success', `成功导入 ${validLogs.length} 条日志！`);
      } catch (error) {
        console.error('Import error:', error);
        showMessage('error', '导入失败：文件格式不正确');
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="relative flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      
      <button
        onClick={handleImportClick}
        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
        title="导入 JSON"
      >
        <Upload size={18} />
        <span className="hidden sm:inline">导入</span>
      </button>

      <button
        onClick={handleExport}
        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
        title="导出 JSON"
      >
        <Download size={18} />
        <span className="hidden sm:inline">导出</span>
      </button>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -10, x: '-50%' }}
            className={`absolute top-full left-1/2 mt-2 px-3 py-1.5 rounded-lg shadow-lg border text-xs font-medium whitespace-nowrap flex items-center gap-1.5 z-50 ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-red-50 text-red-700 border-red-100'
            }`}
          >
            {message.type === 'success' ? <Check size={12} /> : <AlertCircle size={12} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

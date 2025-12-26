
import React from 'react';
import { ScanResult } from '../types';
import { Clock, ExternalLink, Trash2, Copy, Search, Sparkles } from 'lucide-react';

interface HistoryProps {
  history: ScanResult[];
  onClear: () => void;
  onDelete: (id: string) => void;
  onSelect: (item: ScanResult) => void;
}

const History: React.FC<HistoryProps> = ({ history, onClear, onDelete, onSelect }) => {
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Clock className="w-16 h-16 mb-4 stroke-1 opacity-20" />
        <p className="text-lg font-medium">No scan history yet</p>
        <p className="text-sm">Your recent scans will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-24">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-slate-800">Recent Scans</h2>
        <button 
          onClick={onClear}
          className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                {item.type}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {formatDate(item.timestamp)}
              </span>
            </div>
            
            <p className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1 pr-8">
              {item.data}
            </p>

            {item.aiAnalysis && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-indigo-600 bg-indigo-50/50 p-2 rounded-lg italic">
                <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{item.aiAnalysis}</span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); copyToClipboard(item.data); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                title="Copy content"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;


import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, ScanResult } from './types';
import Scanner from './components/Scanner';
import Generator from './components/Generator';
import History from './components/History';
import { analyzeScanContent } from './services/geminiService';
import { 
  Scan, 
  History as HistoryIcon, 
  PlusCircle, 
  Settings, 
  Sparkles, 
  X, 
  Copy, 
  Share2, 
  Globe, 
  Wifi,
  User,
  Mail,
  FileText,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SCAN);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem('scan_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to local storage
  useEffect(() => {
    localStorage.setItem('scan_history', JSON.stringify(history));
  }, [history]);

  const handleScanSuccess = useCallback(async (decodedText: string, decodedResult: any) => {
    // Only process if it's a new result or we aren't already looking at one
    if (currentScan && currentScan.data === decodedText) return;

    const newScan: ScanResult = {
      id: crypto.randomUUID(),
      data: decodedText,
      type: decodedResult?.result?.format?.formatName || 'UNKNOWN',
      timestamp: Date.now()
    };

    setCurrentScan(newScan);
    setHistory(prev => [newScan, ...prev]);

    // Intelligent AI Analysis Trigger
    setIsAnalyzing(true);
    const analysis = await analyzeScanContent(newScan.data, newScan.type);
    
    setHistory(prev => prev.map(item => 
      item.id === newScan.id ? { ...item, aiAnalysis: analysis } : item
    ));
    
    setCurrentScan(prev => prev ? { ...prev, aiAnalysis: analysis } : null);
    setIsAnalyzing(false);
  }, [currentScan]);

  const deleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    if (window.confirm('Delete all history?')) {
      setHistory([]);
    }
  };

  const handleAction = (data: string) => {
    if (data.startsWith('http')) {
      window.open(data, '_blank');
    } else {
      navigator.clipboard.writeText(data);
      alert('Content copied to clipboard!');
    }
  };

  // Parsing Logic Helpers
  const parseWifi = (data: string) => {
    const ssid = data.match(/S:(.*?);/)?.[1];
    const password = data.match(/P:(.*?);/)?.[1];
    const type = data.match(/T:(.*?);/)?.[1];
    const hidden = data.match(/H:(.*?);/)?.[1];
    return ssid ? { ssid, password, type, hidden } : null;
  };

  const parseVCard = (data: string) => {
    if (!data.includes('BEGIN:VCARD')) return null;
    const name = data.match(/FN:(.*?)(?:\n|$)/)?.[1];
    const email = data.match(/EMAIL.*?:(.*?)(?:\n|$)/)?.[1];
    const tel = data.match(/TEL.*?:(.*?)(?:\n|$)/)?.[1];
    const org = data.match(/ORG:(.*?)(?:\n|$)/)?.[1];
    const url = data.match(/URL:(.*?)(?:\n|$)/)?.[1];
    return { name, email, tel, org, url };
  };

  const parseMailTo = (data: string) => {
    if (!data.startsWith('mailto:')) return null;
    const email = data.substring(7).split('?')[0];
    const subject = data.match(/subject=([^&]+)/)?.[1];
    const body = data.match(/body=([^&]+)/)?.[1];
    return { email, subject: subject ? decodeURIComponent(subject) : null, body: body ? decodeURIComponent(body) : null };
  };

  // Component to render parsed details
  const ParsedContent = ({ data }: { data: string }) => {
    const wifi = parseWifi(data);
    const vcard = parseVCard(data);
    const mailto = parseMailTo(data);
    const [showPass, setShowPass] = useState(false);

    if (wifi) {
      return (
        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-indigo-900">WiFi Configuration</span>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between border-b border-indigo-200 pb-2">
              <span className="text-indigo-600 font-medium">Network</span>
              <span className="font-bold text-indigo-900">{wifi.ssid}</span>
            </div>
            {wifi.password && (
              <div className="flex justify-between items-center border-b border-indigo-200 pb-2">
                <span className="text-indigo-600 font-medium">Password</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-900 font-mono">
                    {showPass ? wifi.password : '••••••••'}
                  </span>
                  <button onClick={() => setShowPass(!showPass)} className="text-indigo-400">
                    {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-indigo-600 font-medium">Security</span>
              <span className="font-bold text-indigo-900">{wifi.type || 'None'}</span>
            </div>
          </div>
        </div>
      );
    }

    if (vcard) {
      return (
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-emerald-900">Contact Card</span>
          </div>
          <div className="space-y-2 text-sm">
            {vcard.name && <div className="font-bold text-lg text-emerald-900">{vcard.name}</div>}
            {vcard.org && <div className="text-emerald-700 font-medium">{vcard.org}</div>}
            {vcard.tel && <div className="flex items-center gap-2 text-emerald-800"><span className="text-xs uppercase font-bold opacity-60 w-12">Phone</span> {vcard.tel}</div>}
            {vcard.email && <div className="flex items-center gap-2 text-emerald-800"><span className="text-xs uppercase font-bold opacity-60 w-12">Email</span> {vcard.email}</div>}
            {vcard.url && <div className="flex items-center gap-2 text-emerald-800"><span className="text-xs uppercase font-bold opacity-60 w-12">Site</span> {vcard.url}</div>}
          </div>
        </div>
      );
    }

    if (mailto) {
      return (
        <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-sky-600" />
            <span className="font-bold text-sky-900">Email Draft</span>
          </div>
          <div className="space-y-2 text-sm">
             <div className="flex flex-col"><span className="text-xs uppercase font-bold text-sky-500">To</span> <span className="font-medium text-sky-900">{mailto.email}</span></div>
             {mailto.subject && <div className="flex flex-col"><span className="text-xs uppercase font-bold text-sky-500">Subject</span> <span className="font-medium text-sky-900">{mailto.subject}</span></div>}
             {mailto.body && <div className="flex flex-col"><span className="text-xs uppercase font-bold text-sky-500">Body</span> <p className="text-sky-800 italic bg-sky-100/50 p-2 rounded-lg mt-1">{mailto.body}</p></div>}
          </div>
        </div>
      );
    }

    // Default URL or Text view
    return (
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
         <div className="flex items-center gap-2 mb-2">
            {data.startsWith('http') ? <Globe className="w-4 h-4 text-slate-500"/> : <FileText className="w-4 h-4 text-slate-500"/>}
            <span className="font-bold text-slate-700">{data.startsWith('http') ? 'Web Link' : 'Plain Text'}</span>
          </div>
        <p className="text-slate-800 font-medium break-all whitespace-pre-wrap">{data}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="px-6 py-8 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            ScanMaster <span className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold">Pro AI</span>
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Fast, Smart, Powerful</p>
        </div>
        <div className="relative">
          <button className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pt-6">
        {activeTab === AppTab.SCAN && (
          <div className="animate-in fade-in duration-500">
            <Scanner onScan={handleScanSuccess} isPaused={!!currentScan} />
            <div className="px-8 mt-12 text-center">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">AI Powered</p>
                  <p className="text-xs text-indigo-500 mt-0.5">Our Gemini brain automatically analyzes codes for safety and context.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === AppTab.CREATE && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <Generator />
          </div>
        )}

        {activeTab === AppTab.HISTORY && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <History 
              history={history} 
              onClear={clearHistory} 
              onDelete={deleteFromHistory}
              onSelect={(item) => setCurrentScan(item)}
            />
          </div>
        )}
      </main>

      {/* Results Overlay */}
      {currentScan && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col">
            
            <div className="p-8 overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1 block">
                    {currentScan.type} Detected
                  </span>
                  <h3 className="text-2xl font-bold text-slate-800 leading-tight">
                   Scan Result
                  </h3>
                </div>
                <button 
                  onClick={() => setCurrentScan(null)}
                  className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Parsed Content View (Structured Data) */}
              <div className="mb-6">
                <ParsedContent data={currentScan.data} />
              </div>

              {/* AI Analysis Section */}
              <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                  <Sparkles className="w-12 h-12 text-indigo-600" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">AI Insights</span>
                </div>
                {isAnalyzing ? (
                  <div className="space-y-2">
                    <div className="h-2 bg-indigo-200/50 rounded-full w-full animate-pulse"></div>
                    <div className="h-2 bg-indigo-200/50 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                ) : (
                  <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                    {currentScan.aiAnalysis || "Ready to analyze..."}
                  </p>
                )}
              </div>

              {/* Raw Data Toggle */}
              <div className="mb-8">
                <button 
                  onClick={() => setShowRawData(!showRawData)}
                  className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 flex items-center gap-1"
                >
                  {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
                </button>
                {showRawData && (
                  <div className="mt-2 p-3 bg-slate-100 rounded-xl text-xs font-mono text-slate-600 break-all border border-slate-200">
                    {currentScan.data}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAction(currentScan.data)}
                  className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg hover:translate-y-[-2px]"
                >
                  <div className="p-2 bg-white/10 rounded-xl">
                    {currentScan.data.startsWith('http') ? <Globe className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {currentScan.data.startsWith('http') ? 'Open URL' : 'Copy'}
                  </span>
                </button>
                <button 
                  onClick={() => {
                    if(navigator.share) {
                      navigator.share({ title: 'Shared from ScanMaster', text: currentScan.data });
                    }
                  }}
                  className="flex flex-col items-center justify-center gap-3 p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-200 transition-all hover:translate-y-[-2px]"
                >
                   <div className="p-2 bg-slate-50 rounded-xl">
                    <Share2 className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Share</span>
                </button>
              </div>
            </div>

            <div className="px-8 pb-8 pt-2 bg-white">
              <button 
                onClick={() => setCurrentScan(null)}
                className="w-full py-4 text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Close and scan again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-100 px-8 py-4 flex items-center justify-between sticky bottom-0 z-50">
        <button 
          onClick={() => setActiveTab(AppTab.HISTORY)}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === AppTab.HISTORY ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <HistoryIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
        </button>

        <button 
          onClick={() => { setActiveTab(AppTab.SCAN); setCurrentScan(null); }}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all -mt-10 ${
            activeTab === AppTab.SCAN 
            ? 'bg-indigo-600 text-white scale-110 shadow-indigo-200' 
            : 'bg-white text-slate-400 border border-slate-100'
          }`}
        >
          <Scan className="w-8 h-8" />
        </button>

        <button 
          onClick={() => setActiveTab(AppTab.CREATE)}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === AppTab.CREATE ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Create</span>
        </button>
      </nav>
    </div>
  );
};

export default App;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Send, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Lock, 
  ArrowRight,
  Database,
  Eye,
  Settings,
  AlertCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---

interface Transaction {
  senderName: string;
  senderAccount: string;
  senderHash: string;
  receiverName: string;
  receiverAccount: string;
  receiverHash: string;
  amountSent: number;
  amountReceived: number;
  currency: string;
  timestamp: string;
  id: string;
  confirmedByReceiver: boolean;
}

interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
}

type Role = 'guest' | 'sender' | 'receiver' | 'admin';

// --- Chatbot Component for Admin ---

const AIChatbot = ({ chain }: { chain: Block[] }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Assalomu alaykum, Admin. Men Audit AI-man. Blokcheyndagi yashirin sxemalar yoki pul yuvish shubhalari haqida so'rang." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const txHistory = chain.flatMap(b => b.transactions).map(tx => 
        `Yuboruvchi: ${tx.senderName} (${tx.senderAccount}), Qabul qiluvchi: ${tx.receiverName} (${tx.receiverAccount}), Summa: ${tx.amountSent} UZS`
      ).join('\n');

      const prompt = `Siz Buxgalteriya va Blokcheyn Audit AI-siz. Quyida tranzaksiyalar tarixi keltirilgan:\n${txHistory}\n\nAdmin savoli: ${userMsg}\n\nJavob o'zbek tilida, tahliliy va qisqa bo'lsin. Yashirin sxemalar yoki shubhali bog'liqliklarga e'tibor bering.`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Xulosa qilib bo'lmadi." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Texnik xatolik yuz berdi." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card-bg rounded-[40px] border border-border-color shadow-2xl overflow-hidden">
      <div className="p-8 border-b border-border-color flex items-center gap-4 bg-white/5">
        <div className="w-12 h-12 bg-slate-800 text-accent-blue rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
          <Eye size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-text-primary tracking-tight">Audit AI Chatbot</h3>
          <p className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em] opacity-60">Yashirin sxemalar tahlili</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 hide-scrollbar bg-[#020617]/40">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-6 rounded-[32px] text-sm font-semibold leading-relaxed shadow-xl ${
              m.role === 'user' ? 'bg-accent-blue text-slate-900 rounded-tr-none' : 'bg-slate-800 text-text-primary border border-white/10 rounded-tl-none font-medium'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-slate-800 p-6 rounded-[32px] rounded-tl-none border border-white/10 flex gap-2">
                <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce [animation-delay:0.4s]" />
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-8 bg-card-bg border-t border-border-color flex gap-4">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Tahlil uchun savol yozing..."
          className="flex-1 px-6 py-4 bg-bg-main border border-border-color rounded-2xl text-xs outline-none focus:ring-4 focus:ring-accent-blue/10 text-text-primary font-bold"
        />
        <button type="submit" disabled={loading} className="px-8 bg-accent-blue text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-xl shadow-accent-blue/20">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

// --- Logo Component ---
const NexusCheckLogo = ({ className = "w-12 h-12", showText = false }: { className?: string; showText?: boolean }) => (
  <div className={`flex flex-col items-center ${className}`}>
    <div className="flex items-center gap-2">
      <span className="text-2xl font-black text-[#b4e3bd] leading-none mb-1">N</span>
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#b4e3bd]">
          {/* Central Nexus Point */}
          <circle cx="50" cy="50" r="10" fill="currentColor" />
          {/* Radiating Connections */}
          <path 
            d="M50 20 L50 40 M50 60 L50 80 M20 50 L40 50 M60 50 L80 50 M28.8 28.8 L42.9 42.9 M57.1 57.1 L71.2 71.2 M71.2 28.8 L57.1 42.9 M42.9 57.1 L28.8 71.2" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          {/* Outer Boundary */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" opacity="0.3" />
        </svg>
      </div>
      <span className="text-2xl font-black text-[#b4e3bd] leading-none mb-1">X</span>
    </div>
    {showText && (
      <div className="mt-2 text-center">
        <div className="text-sm font-black text-[#b4e3bd] tracking-[0.2em] uppercase">NEXUSCHECK</div>
        <div className="text-[6px] font-bold text-[#b4e3bd] tracking-widest uppercase mt-1 opacity-80 italic">CENTER OF TRUST AND SECURITY</div>
      </div>
    )}
  </div>
);

// --- Components ---

const Sidebar = ({ role, onLogout, activeTab, setActiveTab }: { 
  role: Role, 
  onLogout: () => void, 
  activeTab: string, 
  setActiveTab: (tab: string) => void 
}) => {
  const menuItems = useMemo(() => {
    const base = [
      { id: 'dashboard', label: 'Boshqaruv', icon: ShieldCheck },
      { id: 'blockchain', label: 'Blokcheyn', icon: History }
    ];
    
    if (role === 'admin') {
      return [
        ...base,
        { id: 'ai-chat', label: 'AI Chatbot', icon: Eye },
        { id: 'ai-reports', label: 'AI Audit', icon: AlertCircle },
        { id: 'violations', label: 'Qonunbuzarliklar', icon: AlertTriangle },
        { id: 'branding', label: 'Loyihaga Kirish', icon: Briefcase }
      ];
    }
    
    if (role === 'receiver') {
      return [
        ...base,
        { id: 'receipts', label: 'Qabul Qilish', icon: CheckCircle2 }
      ];
    }
    
    return base;
  }, [role]);

  return (
    <aside className="w-64 bg-sidebar-bg text-sidebar-text flex flex-col h-screen sticky top-0 hide-scrollbar overflow-y-auto shadow-2xl z-20">
      <div className="p-8 mb-4">
        <div className="flex flex-col items-center group cursor-pointer bg-black/40 p-6 rounded-[32px] border border-white/5 hover:border-[#b4e3bd]/20 transition-all" onClick={() => setActiveTab('dashboard')}>
          <NexusCheckLogo className="scale-75" />
          <div className="flex flex-col items-center mt-4">
            <span className="text-xl font-black tracking-tighter text-white leading-none">NEXUSCHECK</span>
            <span className="text-[8px] font-bold text-[#b4e3bd] uppercase tracking-[0.3em] mt-1">Audit AI</span>
          </div>
        </div>
      </div>
      
      <nav className="px-4 space-y-1.5 flex-1">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-4 py-3.5 rounded-2xl text-sm font-bold cursor-pointer flex items-center gap-3 transition-all duration-200 ${
              activeTab === item.id 
              ? 'bg-white/10 text-white border-l-4 border-accent-blue' 
              : 'text-sidebar-text/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={18} className={activeTab === item.id ? 'text-accent-blue' : ''} />
            {item.label}
          </div>
        ))}
      </nav>

      <div className="px-4 pb-8 space-y-4">
        {role !== 'guest' && (
          <button 
            onClick={onLogout}
            className="w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-all text-center"
          >
            Tizimdan Chiqish
          </button>
        )}

        <div className="pt-6 border-t border-white/10 opacity-40 text-[10px] leading-relaxed">
          Tizim versiyasi: v1.1.0-alpha<br />
          Node Status: <span className="text-accent-green">Online</span><br />
          Role: <span className="text-accent-blue uppercase font-bold">{role}</span>
        </div>
      </div>
    </aside>
  );
};

const SleekHeader = ({ role, searchTerm, setSearchTerm }: { role: Role, searchTerm: string, setSearchTerm: (s: string) => void }) => (
  <header className="h-[72px] bg-card-bg border-b border-border-color flex items-center justify-between px-8 sticky top-0 z-10 w-full transition-colors">
    <div className="flex-1 max-w-md">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-blue transition-colors" size={16} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ID, yuboruvchi yoki qabul qiluvchi..."
          className="w-full pl-12 pr-4 py-3 bg-bg-main border border-border-color rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue transition-all text-text-primary font-medium"
        />
      </div>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-end text-right">
        <span className="text-[10px] font-black text-accent-green uppercase tracking-[0.2em] leading-none mb-1 shadow-sm">Jonli Nazorat</span>
        <span className="text-xs font-black text-text-primary leading-none">Admin: Asadxoja</span>
      </div>
      <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-accent-blue flex items-center justify-center p-0.5 shadow-lg shadow-accent-blue/20">
        <div className="w-full h-full rounded-full bg-slate-700 overflow-hidden">
          <img src="https://picsum.photos/seed/asad/40/40" referrerPolicy="no-referrer" alt="Profile" />
        </div>
      </div>
    </div>
  </header>
);

const StatGrid = ({ chain }: { chain: Block[] }) => {
  const transactions = chain.flatMap(b => b.transactions);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[
        { label: 'Umumiy Bloklar', val: chain.length, color: 'text-accent-blue' },
        { label: 'AI To\'xtatganlar', val: '48', color: 'text-accent-red' },
        { label: 'Smart-Kontraktlar', val: '100% Faol', color: 'text-accent-green' }
      ].map((stat, i) => (
        <div key={i} className="bg-card-bg p-8 rounded-[32px] border border-border-color shadow-lg shadow-black/20">
          <div className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3">{stat.label}</div>
          <div className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.val}</div>
        </div>
      ))}
    </div>
  );
};

const TransactionForm = ({ onSend, loading, aiReport }: { 
  onSend: (tx: any) => void, 
  loading: boolean, 
  aiReport: { status: string; message: string; auditStatus?: string } | null 
}) => {
  const [tx, setTx] = useState({
    senderName: '',
    senderAccount: '',
    receiverName: '',
    receiverAccount: '',
    amountSent: '',
    amountReceived: '',
  });

  const [simulatingBiometrics, setSimulatingBiometrics] = useState(false);
  const [biometricHash, setBiometricHash] = useState<string | null>(null);

  const scanFace = async () => {
    setSimulatingBiometrics(true);
    await new Promise(r => setTimeout(r, 2000));
    const hash = Math.random().toString(36).substring(7).toUpperCase();
    setBiometricHash(hash);
    setSimulatingBiometrics(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!biometricHash) {
      alert("Iltimos, avval yuboruvchi biometrik tasdiqidan o'ting!");
      return;
    }
    
    // Target hash for receiver is simplified: base on sender for this demo
    // but typically it would be pre-registered receiver data
    const targetHash = Math.random().toString(36).substring(7).toUpperCase(); 

    onSend({
      ...tx,
      amountSent: Number(tx.amountSent),
      amountReceived: Number(tx.amountReceived),
      currency: 'UZS',
      senderHash: biometricHash,
      receiverHash: targetHash // This is what the receiver must match
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card-bg rounded-[40px] border border-border-color p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h2 className="text-2xl font-black text-text-primary tracking-tight">O'tkazmani shakllantirish</h2>
             <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-60">Blokcheyn va AI nazorati ostida</p>
           </div>
           <div className="bg-accent-blue/10 text-accent-blue px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">
             UZS Valyutasi
           </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-bg-main rounded-[40px] border border-border-color shadow-inner">
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-text-secondary mb-2">
                 <User size={16} className="text-accent-blue" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Yuboruvchi (Eksportyor)</span>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-4 opacity-40">Tashkilot Nomi</label>
                  <input required type="text" placeholder="Kompaniya nomi..." className="w-full px-6 py-4 rounded-[24px] border border-border-color text-sm outline-none focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue transition-all bg-card-bg text-text-primary font-bold placeholder:text-text-secondary/30" value={tx.senderName} onChange={e => setTx({...tx, senderName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-4 opacity-40">Bank hisobi</label>
                  <input required type="text" placeholder="Bank hisob raqami..." className="w-full px-6 py-4 rounded-[24px] border border-border-color text-sm outline-none focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue transition-all bg-card-bg text-text-primary font-bold placeholder:text-text-secondary/30" value={tx.senderAccount} onChange={e => setTx({...tx, senderAccount: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-4 opacity-40">O'tkazma Summasi</label>
                  <div className="relative">
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-accent-blue/40">SO'M</span>
                    <input required type="number" placeholder="0.00" className="w-full pl-6 pr-16 py-4 rounded-[24px] border border-border-color text-sm outline-none focus:ring-4 focus:ring-accent-blue/10 focus:border-accent-blue transition-all bg-card-bg text-text-primary font-bold placeholder:text-text-secondary/30" value={tx.amountSent} onChange={e => setTx({...tx, amountSent: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3 text-text-secondary mb-2">
                 <User size={16} className="text-accent-green" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Qabul Qiluvchi (Importyor)</span>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-4 opacity-40">Tashkilot Nomi</label>
                  <input required type="text" placeholder="Kompaniya nomi..." className="w-full px-6 py-4 rounded-[24px] border border-border-color text-sm outline-none focus:ring-4 focus:ring-accent-green/10 focus:border-accent-green transition-all bg-card-bg text-text-primary font-bold placeholder:text-text-secondary/30" value={tx.receiverName} onChange={e => setTx({...tx, receiverName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-4 opacity-40">Bank hisobi</label>
                  <input required type="text" placeholder="Bank hisob raqami..." className="w-full px-6 py-4 rounded-[24px] border border-border-color text-sm outline-none focus:ring-4 focus:ring-accent-green/10 focus:border-accent-green transition-all bg-card-bg text-text-primary font-bold placeholder:text-text-secondary/30" value={tx.receiverAccount} onChange={e => setTx({...tx, receiverAccount: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-4 opacity-40">Kutilayotgan Summa</label>
                  <div className="relative">
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-accent-green/40">SO'M</span>
                    <input required type="number" placeholder="0.00" className="w-full pl-6 pr-16 py-4 rounded-[24px] border border-border-color text-sm outline-none focus:ring-4 focus:ring-accent-green/10 focus:border-accent-green transition-all bg-card-bg text-text-primary font-bold placeholder:text-text-secondary/30" value={tx.amountReceived} onChange={e => setTx({...tx, amountReceived: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-800 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-black/40 border border-white/5">
             <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 border-dashed shadow-inner transition-all duration-500 ${biometricHash ? 'border-accent-green bg-accent-green/10 text-accent-green' : 'border-white/20 bg-white/5 text-white/40'}`}>
                   {simulatingBiometrics ? <div className="w-8 h-8 border-4 border-white/10 border-t-accent-blue rounded-full animate-spin" /> : biometricHash ? <CheckCircle2 size={36} /> : <Lock size={36} />}
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Biometrik Hashlash</div>
                   <div className="text-lg font-black tracking-tight">{biometricHash ? `HASH: ${biometricHash.substring(0, 12)}...` : 'Identifikatsiya kutilmoqda'}</div>
                </div>
             </div>
             <button 
               type="button" 
               onClick={scanFace}
               disabled={simulatingBiometrics}
               className="px-10 py-5 bg-accent-blue text-slate-900 rounded-[20px] text-xs font-black uppercase tracking-[0.2em] hover:bg-white transition-all disabled:opacity-50 shadow-xl shadow-accent-blue/10"
             >
               Yuzni Skanerlash (AI)
             </button>
          </div>

          <button
            disabled={loading || simulatingBiometrics}
            type="submit"
            className="w-full py-5 bg-accent-blue text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-accent-blue/30 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ShieldCheck size={18} /> Shartnomani blokcheynga muhrlash</>}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {aiReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[32px] p-10 border-2 ${
              aiReport.status === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-rose-50 border-rose-100 text-rose-800'
            } shadow-lg shadow-black/5`}
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-xl ${
                aiReport.status === 'success' ? 'bg-emerald-100 text-emerald-600 shadow-emerald-500/20' : 'bg-rose-100 text-rose-600 shadow-rose-500/20'
              }`}>
                {aiReport.status === 'success' ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
              </div>
              <div className="space-y-6 flex-1">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">AI Strategik Tahlili</div>
                  <h4 className="text-2xl font-black tracking-tight mb-2 text-slate-900">Audit Xulosasi</h4>
                  <p className="text-sm leading-relaxed font-medium opacity-80">{aiReport.message}</p>
                </div>
                {aiReport.auditStatus && (
                  <div className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-border-color">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono italic">Audit Log:</div>
                    <p className="text-xs font-mono text-slate-600 leading-relaxed italic">{aiReport.auditStatus}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BlockchainTable = ({ chain, filterReceiverName, searchTerm }: { chain: Block[], filterReceiverName?: string, searchTerm?: string }) => {
  const allTxs = useMemo(() => {
    return chain.slice().reverse().flatMap(b => b.transactions.map(tx => ({ ...tx, blockIndex: b.index })));
  }, [chain]);

  const filtered = useMemo(() => {
    let txs = allTxs;
    
    if (filterReceiverName) {
      txs = txs.filter(t => t.receiverName.toLowerCase().includes(filterReceiverName.toLowerCase()));
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      txs = txs.filter(tx => 
        tx.id.toLowerCase().includes(s) || 
        tx.senderName.toLowerCase().includes(s) || 
        tx.receiverName.toLowerCase().includes(s) ||
        tx.senderAccount.toLowerCase().includes(s) ||
        tx.receiverAccount.toLowerCase().includes(s)
      );
    }
    
    return txs;
  }, [allTxs, filterReceiverName, searchTerm]);

  return (
    <div className="bg-card-bg rounded-[40px] border border-border-color overflow-hidden shadow-2xl flex flex-col h-full border-b-8 border-b-accent-blue/10">
      <div className="p-8 border-b border-border-color flex items-center justify-between bg-white/5">
        <h2 className="text-xl font-black text-text-primary flex items-center gap-3 tracking-tight">
          <Database size={24} className="text-accent-blue" />
          Blokcheyn Registri
          <span className="text-[10px] text-accent-green bg-accent-green/10 border border-accent-green/20 px-3 py-1.5 rounded-full font-black uppercase tracking-widest">Active nodes</span>
        </h2>
      </div>
      <div className="overflow-auto flex-1 h-full min-h-[400px]">
        <table className="w-full border-collapse">
          <thead className="bg-[#0f172a] sticky top-0 z-20">
            <tr>
              <th className="text-left text-[10px] uppercase font-bold text-text-secondary px-8 py-5 border-b border-border-color tracking-[0.2em]">Blok / Status</th>
              <th className="text-left text-[10px] uppercase font-bold text-text-secondary px-8 py-5 border-b border-border-color tracking-[0.2em]">Tashkilotlar</th>
              <th className="text-left text-[10px] uppercase font-bold text-text-secondary px-8 py-5 border-b border-border-color tracking-[0.2em]">Summa</th>
              <th className="text-left text-[10px] uppercase font-bold text-text-secondary px-8 py-5 border-b border-border-color tracking-[0.2em]">Vaqt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[13px]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-24 text-center text-text-secondary font-black uppercase tracking-[0.3em] text-xs italic opacity-40">Ma'lumot topilmadi</td>
              </tr>
            ) : (
              filtered.map((tx, i) => (
                <tr key={tx.id || i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <span className="bg-slate-800 text-white font-mono text-[11px] font-bold px-3 py-1.5 rounded-xl border border-white/5 shadow-sm">BLOCK #{tx.blockIndex}</span>
                       <div className="flex flex-col">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${tx.confirmedByReceiver ? 'text-accent-green' : 'text-amber-500'}`}>
                            {tx.confirmedByReceiver ? 'MUHRLANGAN' : 'KUTILMOQDA'}
                          </span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                      <div className="flex items-center gap-4 font-black text-text-primary">
                        <span className="truncate max-w-[140px] text-sm">{tx.senderName}</span>
                        <ArrowRight size={16} className="text-accent-blue opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="truncate max-w-[140px] text-sm">{tx.receiverName}</span>
                      </div>
                      <div className="text-[10px] font-mono font-bold text-text-secondary mt-1 opacity-60">ID: {tx.id.substring(0,12)}...</div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="text-lg font-black text-text-primary tracking-tight">
                        {tx.amountSent.toLocaleString()} <span className="text-xs font-bold text-text-secondary opacity-60">UZS</span>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-2 text-text-secondary font-bold text-xs opacity-70">
                        <Clock size={14} />
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BrandingPanel = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Hero */}
      <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent-blue via-transparent to-transparent" />
         <div className="relative z-10 max-w-2xl">
            <div className="inline-block bg-accent-blue/20 text-accent-blue px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6 border border-accent-blue/30">Loyiha Misiyasi</div>
            <h2 className="text-5xl font-black tracking-tighter leading-tight mb-6">Xavfsiz Kelajak: <br /><span className="text-accent-blue">Blokcheyn va AI Simbiozi</span></h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">Biz korrupsiyaga qarshi kurashda eng zamonaviy texnologiyalarni birlashtirdik. Bizning maqsadimiz — moliyaviy shaffoflikni yangi bosqichga olib chiqish.</p>
            <div className="flex items-center gap-8">
               <div>
                  <div className="text-3xl font-black text-white">100%</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shaffoflik</div>
               </div>
               <div className="w-px h-10 bg-white/10" />
               <div>
                  <div className="text-3xl font-black text-white">24/7</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Nazorat</div>
               </div>
            </div>
         </div>
         <div className="absolute right-[-10%] top-[-10%] w-[50%] aspect-square bg-accent-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-card-bg p-8 rounded-[40px] border border-border-color shadow-lg shadow-black/20 flex flex-col hover:border-accent-blue transition-all group">
            <div className="w-16 h-16 bg-accent-blue/5 rounded-2xl flex items-center justify-center text-accent-blue mb-8 group-hover:scale-110 transition-transform">
              <Database size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-text-primary mb-4 tracking-tight">Nimalar qo'shildi?</h3>
            <ul className="space-y-4 text-xs text-text-secondary font-bold">
               <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-accent-blue rounded-full mt-1 shrink-0" />
                  <span><b>Blokcheyn Registri:</b> Har bir amal muhrlanadi.</span>
               </li>
               <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-accent-blue rounded-full mt-1 shrink-0" />
                  <span><b>Audit AI:</b> Pul yuvishni aniqlovchi mantiq.</span>
               </li>
               <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-accent-blue rounded-full mt-1 shrink-0" />
                  <span><b>Biometrik Hash:</b> Yuz orqali tasdiqlash.</span>
               </li>
            </ul>
        </div>

        <div className="bg-card-bg p-8 rounded-[40px] border border-border-color shadow-lg shadow-black/20 flex flex-col hover:border-accent-blue transition-all group">
            <div className="w-16 h-16 bg-accent-blue/5 rounded-2xl flex items-center justify-center text-accent-blue mb-8 group-hover:scale-110 transition-transform">
              <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-text-primary mb-4 tracking-tight">Afzalliklar</h3>
            <ul className="space-y-4 text-xs text-text-secondary font-bold">
               <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-accent-blue rounded-full mt-1 shrink-0" />
                  <span><b>O'zgarmaslik:</b> Tarixni o'chirib bo'lmaydi.</span>
               </li>
               <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-accent-blue rounded-full mt-1 shrink-0" />
                  <span><b>Shaffoflik:</b> Jamiyat uchun ochiq audit.</span>
               </li>
            </ul>
        </div>

        <div className="bg-card-bg p-8 rounded-[40px] border border-border-color shadow-lg shadow-black/20 flex flex-col hover:border-accent-green transition-all group">
            <div className="w-16 h-16 bg-accent-green/5 rounded-2xl flex items-center justify-center text-accent-green mb-8 group-hover:scale-110 transition-transform">
              <History size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-text-primary mb-4 tracking-tight">Muammo & Yechim</h3>
            <div className="space-y-4">
              <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                 <p className="text-[10px] text-rose-400 font-black tracking-tight leading-tight uppercase">Yashirin sxemalar va hujjatlarni soxtalashtirish.</p>
              </div>
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                 <p className="text-[10px] text-emerald-400 font-black tracking-tight leading-tight uppercase">AI va Blokcheyn orqali 100% verifikatsiya.</p>
              </div>
            </div>
        </div>

        <div className="bg-card-bg p-8 rounded-[40px] border border-border-color shadow-lg shadow-black/20 flex flex-col hover:border-text-primary transition-all group">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform border border-white/10">
              <Settings size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-text-primary mb-4 tracking-tight">Qulayliklar</h3>
            <ul className="space-y-4 text-xs text-text-secondary font-bold">
               <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-1 shrink-0 opacity-40" />
                  <span><b>Yuz Skaneri:</b> Parollarsiz xavfsiz tasdiq.</span>
               </li>
               <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-1 shrink-0 opacity-40" />
                  <span><b>AI Chatbot:</b> Savollarga 24/7 javoblar.</span>
               </li>
            </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          onMouseEnter={() => setHovered(0)}
          onMouseLeave={() => setHovered(null)}
          className={`bg-white p-10 rounded-[40px] border border-border-color shadow-sm flex flex-col justify-center transition-all duration-500 ${hovered === 0 ? 'border-accent-blue scale-[1.02] shadow-2xl shadow-accent-blue/10' : ''}`}
        >
          <div className="mb-8">
            <div className={`w-20 h-20 bg-accent-blue rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-accent-blue/30 mb-6 transition-transform duration-500 ${hovered === 0 ? 'scale-110 rotate-12' : ''}`}>
              <ShieldCheck size={48} strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">NexusCheck Audit</h2>
            <p className="text-slate-500 font-medium">Buxgalteriya uchun blokcheyn va AI asosidagi xavfsizlik brendi.</p>
          </div>
          
          <div className={`space-y-4 transition-opacity duration-500 ${hovered === 0 ? 'opacity-100' : 'opacity-60'}`}>
            <div className="flex items-center gap-3">
               <div className="w-6 h-6 rounded-full bg-accent-blue" />
               <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest">Primary: #3B82F6</span>
            </div>
            {hovered === 0 && (
              <div className="text-[10px] text-accent-blue font-bold p-4 bg-accent-blue/5 rounded-2xl animate-in zoom-in-95 duration-300">
                NexusCheck Audit tizimi moliyaviy barqarorlik va korrupsiyaga qarshi kurash ramzidir. 
                Ushbu rang ishonch va shaffoflikni anglatadi.
              </div>
            )}
          </div>
        </div>

        <div className="relative group overflow-hidden rounded-[40px] aspect-[4/3] bg-slate-900 border border-border-color">
           <img 
             src="https://picsum.photos/seed/blockchain-ai-audit/800/600" 
             alt="Brand Concept" 
             className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" 
             referrerPolicy="no-referrer"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent p-10 flex flex-col justify-end">
              <div className="text-[10px] font-bold text-accent-blue uppercase tracking-widest mb-2 font-mono italic">Primary AI Visualization</div>
              <h3 className="text-3xl font-black text-white leading-tight group-hover:translate-x-2 transition-transform">Blokcheyn va AI Simbiozi</h3>
              <p className="text-sm text-slate-300 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                Audit AI tranzaksiyalarning har bir qadamini tahlil qiladi. U yashirin sxemalarni aniqlashda 
                inson ko'zi yetmagan nuqtalarni ko'ra oladi.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const ViolationsPanel = ({ chain }: { chain: Block[] }) => {
  const [reportModal, setReportModal] = useState<{ open: boolean, data: Transaction | null }>({ open: false, data: null });
  const [sending, setSending] = useState(false);

  const violations = useMemo(() => {
    return chain.flatMap(b => b.transactions).filter(tx => {
      const diff = Math.abs(tx.amountSent - tx.amountReceived);
      // Only treat as violation if diff is NOT 0
      return (diff !== 0 && tx.confirmedByReceiver) || tx.amountSent > 500000;
    });
  }, [chain]);

  const handleSendReport = async () => {
    setSending(true);
    // Simulate API call to report
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setReportModal({ open: false, data: null });
    alert("Hisobot muvaffaqiyatli markaziy nazorat organiga yuborildi.");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card-bg rounded-[40px] border border-border-color p-10 shadow-2xl border-b-8 border-b-accent-red">
         <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-rose-500/10 text-accent-red rounded-2xl flex items-center justify-center border border-rose-500/20">
               <AlertTriangle size={32} />
             </div>
             <div>
               <h2 className="text-3xl font-black text-text-primary tracking-tight">Shubhali Amallar</h2>
               <p className="text-text-secondary text-sm">AI tomonidan aniqlangan va mantiqiy xatoliklari mavjud tranzaksiyalar.</p>
             </div>
           </div>
           <div className="bg-rose-500/20 text-accent-red px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
             {violations.length} ta ogohlantirish
           </div>
         </div>

         <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead className="border-b border-border-color">
               <tr>
                 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vaqt</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yuboruvchi Hisob</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qabul qiluvchi Hisob</th>
                 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amal</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {violations.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="py-20 text-center text-slate-400 italic">Hozircha shubhali amallar aniqlanmadi.</td>
                 </tr>
               ) : (
                 violations.map((tx, i) => (
                   <tr key={i} className="hover:bg-rose-50/30 transition-colors">
                     <td className="px-6 py-5 text-xs font-mono text-slate-400">{new Date(tx.timestamp).toLocaleString()}</td>
                     <td className="px-6 py-5">
                       <div className="font-bold text-slate-900">{tx.senderName} ➔ {tx.receiverName}</div>
                       <div className="text-[10px] text-slate-400 font-mono">{tx.senderAccount}</div>
                     </td>
                     <td className="px-6 py-5">
                        <span className="font-black text-accent-red">
                          ${(tx.amountSent - tx.amountReceived).toLocaleString()} farq
                        </span>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => setReportModal({ open: true, data: tx })}
                          className="px-5 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-900/10 uppercase tracking-widest"
                        >
                          Hisobot Yuborish
                        </button>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
      </div>

      <AnimatePresence>
        {reportModal.open && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] p-10 max-w-lg w-full shadow-2xl border border-border-color"
            >
              <h3 className="text-2xl font-black text-slate-900 mb-2">Qonunbuzarlik Hisoboti</h3>
              <p className="text-slate-500 text-sm mb-8">Ushbu tranzaksiya bo'yicha markaziy prokuratura organiga hisobot yubormoqchimisiz?</p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-border-color mb-8 space-y-3">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tranzaksiya Tafsilotlari</div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Yuboruvchi:</span>
                   <span className="font-bold">{reportModal.data?.senderName}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Qabul Qiluvchi:</span>
                   <span className="font-bold">{reportModal.data?.receiverName}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Summa:</span>
                   <span className="font-bold text-accent-red">${reportModal.data?.amountSent.toLocaleString()}</span>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button 
                   onClick={() => setReportModal({ open: false, data: null })}
                   className="flex-1 py-3.5 border border-border-color text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm uppercase tracking-widest"
                 >
                   Bekor qilish
                 </button>
                 <button 
                   disabled={sending}
                   onClick={handleSendReport}
                   className="flex-1 py-3.5 bg-accent-red text-white font-bold rounded-2xl hover:bg-red-600 transition-all text-sm shadow-lg shadow-accent-red/20 uppercase tracking-widest flex items-center justify-center gap-2"
                 >
                   {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Yuborish</>}
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminPanel = ({ chain }: { chain: Block[] }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const getAIAdvice = async (tx: Transaction) => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Siz Buxgalteriya va Blokcheyn bo'yicha mustaqil nazoratchi AI-siz. Quyidagi tranzaksiyani pul yuvish (Money Laundering) uchun tahlil qiling:
      Yuboruvchi: ${tx.senderName}, Qabul qiluvchi: ${tx.receiverName}, Summa: ${tx.amountSent} UZS.
      Javob o'zbek tilida, qisqa va professional bo'lsin.`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt
      });
      setAnalysis(response.text || "Xulosa qilib bo'lmadi.");
    } catch (error) {
      console.error("AI Error (Admin):", error);
      setAnalysis("AI bilan bog'lanishda xatolik.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      <div className="lg:col-span-2 space-y-8">
        <StatGrid chain={chain} />
        <BlockchainTable chain={chain} />
      </div>

      <div className="space-y-6 flex flex-col h-full">
        <div className="card bg-card-bg rounded-[40px] border border-border-color p-10 shadow-2xl h-full flex flex-col">
          <div className="text-lg font-black text-text-primary mb-8 border-b border-white/5 pb-4 tracking-tight uppercase tracking-[0.1em]">AI Nazoratchi Tahlili</div>
          
          <div className="space-y-8 flex-1">
            <div className="border-l-4 border-accent-blue pl-6 py-2">
              <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 opacity-60">AI 1: Mantiqiy Tahlil</div>
              <p className="text-sm text-text-secondary leading-relaxed font-semibold">
                Tizim barcha o'tgan tranzaksiyalarni tahlil qilib, mantiqiy bog'liqlikni qidirmoqda.
              </p>
            </div>

            <div className="border-l-4 border-accent-green pl-6 py-6 bg-white/5 rounded-r-3xl border border-white/5 shadow-inner">
              <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 opacity-60">AI 2: Audit Verifikator</div>
              {analyzing ? (
                <div className="flex items-center gap-3 text-accent-blue font-black text-xs uppercase tracking-widest">
                   <div className="w-4 h-4 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
                   Analiz qilinmoqda...
                </div>
              ) : analysis ? (
                <p className="text-sm font-black text-accent-green leading-relaxed">{analysis}</p>
              ) : (
                <p className="text-sm text-slate-500 italic font-bold">Blockchain ro'yxatidan tranzaksiyani tanlang.</p>
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-dashed border-white/10">
              <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 opacity-50">Smart-Kontrakt:</div>
              <div className="text-sm font-black text-text-primary flex items-center gap-2">
                 <ShieldCheck size={18} className="text-accent-green" /> Verifikatsiya yakunlandi
              </div>
            </div>
          </div>

          <div className="danger-zone bg-rose-500/10 border border-rose-500/20 p-8 rounded-[40px] mt-12 shadow-inner">
            <div className="text-accent-red font-black text-sm mb-3 flex items-center gap-2 uppercase tracking-wide">
              <AlertTriangle size={20} /> Shubhali Harakat Aniqlangan
            </div>
            <p className="text-xs text-rose-400 leading-relaxed mb-6 font-bold">
              Tizim avtomatik ravishda shubhali tranzaksiyalarni 'Qonunbuzarliklar' bo'limiga yo'naltiradi.
            </p>
            <button className="w-full py-4 bg-accent-red text-white rounded-2xl text-[10px] font-black hover:bg-red-600 transition-all shadow-2xl shadow-accent-red/20 uppercase tracking-[0.2em]">
              Global Audit Yuborish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReceiptsPanel = ({ chain, onConfirm }: { chain: Block[], onConfirm: (txId: string, hash: string) => Promise<boolean> }) => {
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);
  const [scanning, setScanning] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>('');

  const pendingReceipts = useMemo(() => {
    return chain.flatMap(b => b.transactions).filter(tx => !tx.confirmedByReceiver);
  }, [chain]);

  const handleReceipt = async () => {
    if (!activeTx) return;
    setScanning(true);
    setAiStatus('AI yuz tuzilishini tahlil qilmoqda...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      // Simulate AI analysis of the face scan
      await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: `Siz Biometrik Audit AI-siz. Qabul qiluvchining yuz skanerini (simulyatsiya) tahlil qiling va biometrik hash yaratilishini tasvirlang. Tranzaksiya ID: ${activeTx.id}. Javob o'zbek tilida, qisqa bo'lsin.`
      });
      
      setAiStatus('Hash yaratildi: ' + activeTx.receiverHash.substring(0, 16) + '...');
      await new Promise(r => setTimeout(r, 1000));
      
      setScanning(false);
      setConfirming(true);
      setAiStatus('Blokcheyn bilan solishtirilmoqda (ZKP)...');
      
      const success = await onConfirm(activeTx.id, activeTx.receiverHash);
      if (success) {
        setActiveTx(null);
      }
    } catch (err) {
      console.error(err);
      alert("AI tasdiqlashda xatolik.");
    } finally {
      setScanning(false);
      setConfirming(false);
      setAiStatus('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-card-bg rounded-[40px] border border-border-color p-10 shadow-2xl border-b-8 border-b-accent-blue">
         <div className="flex items-center justify-between mb-10">
           <div>
             <h2 className="text-3xl font-black text-text-primary tracking-tight">Kutilayotgan O'tkazmalar</h2>
             <p className="text-text-secondary font-black opacity-60">Shaxsingizni AI orqali tasdiqlab, mablag'ni qabul qiling.</p>
           </div>
           <div className="w-16 h-16 bg-accent-blue text-slate-900 rounded-[28px] flex items-center justify-center shadow-2xl shadow-accent-blue/20">
             <Clock size={32} />
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pendingReceipts.length === 0 ? (
              <div className="col-span-2 py-24 text-center bg-bg-main rounded-[40px] border-2 border-dashed border-border-color">
                <p className="text-text-secondary font-black uppercase tracking-[0.3em] text-xs opacity-40">Hozircha yangi o'tkazmalar yo'q</p>
              </div>
            ) : (
              pendingReceipts.map(tx => (
                <div key={tx.id} className="bg-bg-main p-8 rounded-[40px] border border-border-color hover:border-accent-blue transition-all group shadow-inner">
                   <div className="flex justify-between items-start mb-8">
                      <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest bg-card-bg px-4 py-2 rounded-xl border border-white/5">TRX ID: {tx.id.substring(0,12)}</div>
                      <div className="text-lg font-black text-accent-blue tracking-tighter">+{tx.amountSent.toLocaleString()} UZS</div>
                   </div>
                   <div className="mb-8">
                      <div className="text-[10px] text-text-secondary font-black uppercase tracking-widest mb-2 opacity-50">Yuboruvchi tashkilot:</div>
                      <div className="text-2xl font-black text-text-primary tracking-tight">{tx.senderName}</div>
                      <div className="text-xs font-mono font-bold text-accent-blue opacity-60 mt-1">{tx.senderAccount}</div>
                   </div>
                   <button 
                     onClick={() => setActiveTx(tx)}
                     className="w-full py-5 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl group-hover:scale-[1.02]"
                   >
                     Qabul Qilishni Tasdiqlash
                   </button>
                </div>
              ))
            )}
         </div>
       </div>

       <AnimatePresence>
          {activeTx && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[48px] p-12 max-w-xl w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-blue via-accent-green to-accent-blue animate-gradient" />
                
                <div className="text-center space-y-6">
                   <div className="relative w-32 h-32 mx-auto mb-8">
                      <div className={`absolute inset-0 rounded-full border-4 border-dashed border-accent-blue ${(scanning || confirming) ? 'animate-spin-slow' : 'opacity-20'}`} />
                      <div className="absolute inset-4 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                         {(scanning || confirming) ? <img src={`https://picsum.photos/seed/face/${activeTx.id.length}/200/200`} className="w-full h-full object-cover grayscale opacity-50 transition-all duration-1000 scale-110" referrerPolicy="no-referrer" /> : <User size={48} className="text-slate-300" />}
                      </div>
                      {(scanning || confirming) && <div className="absolute inset-0 bg-accent-blue/10 animate-pulse rounded-full" />}
                   </div>

                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">AI Biometrik Tasdiqlash</h3>
                   <p className="text-slate-500 text-sm leading-relaxed">
                     Proof of Receipt (ZKP) texnologiyasi orqali shaxsingizni tasdiqlang. 
                     Biometrik ma'lumotlaringiz AI orqali hash ko'rinishida blokcheyn bilan solishtiriladi.
                   </p>

                   {aiStatus && (
                     <div className="bg-accent-blue/5 border border-accent-blue/20 p-4 rounded-2xl text-accent-blue text-[10px] font-black uppercase tracking-widest animate-pulse">
                       {aiStatus}
                     </div>
                   )}

                   <div className="bg-slate-50 p-6 rounded-[24px] border border-border-color text-left divide-y divide-slate-200">
                      <div className="py-2 flex justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tranzaksiya:</span>
                        <span className="text-xs font-bold text-slate-900">{activeTx.id.substring(0,8)}</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Target Hash:</span>
                        <span className="text-xs font-mono font-bold text-accent-blue">{activeTx.receiverHash.substring(0,16)}...</span>
                      </div>
                   </div>

                   <div className="flex gap-4 pt-6">
                      <button 
                         onClick={() => { setActiveTx(null); setAiStatus(''); }}
                         className="flex-1 py-4 border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 transition-all"
                       >
                         Bekor qilish
                       </button>
                       <button 
                         disabled={scanning || confirming}
                         onClick={handleReceipt}
                         className="flex-3 py-4 bg-accent-blue text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-accent-blue/20 flex items-center justify-center gap-2"
                       >
                         {scanning ? 'Skanerlanmoqda...' : confirming ? 'Tasdiqlanmoqda...' : <><Eye size={16} /> AI Skanerlash va Tasdiqlash</>}
                       </button>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [role, setRole] = useState<Role>('guest');
  const [password, setPassword] = useState('');
  const [chain, setChain] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<{ status: string; message: string; auditStatus?: string } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBlockchain = async () => {
    try {
      const resp = await fetch('/api/blockchain');
      const data = await resp.json();
      setChain(data.chain);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBlockchain();
    const interval = setInterval(fetchBlockchain, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendTransaction = async (txData: any) => {
    setLoading(true);
    setAiReport(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: `Siz Buxgalteriya nazorati AI-siz. Quyidagi tranzaksiyani pul yuvish va korrupsiya belgilari bo'yicha tahlil qiling: ${JSON.stringify(txData)}.`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              approved: { type: Type.BOOLEAN },
              reason: { type: Type.STRING },
              auditStatus: { type: Type.STRING }
            },
            required: ["approved", "reason", "auditStatus"]
          }
        }
      });
      
      const result = JSON.parse(response.text || "{}");

      if (result.approved) {
        const resp = await fetch('/api/transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaction: txData })
        });
        if (resp.ok) {
          setAiReport({ status: 'success', message: result.reason, auditStatus: result.auditStatus });
          fetchBlockchain();
        }
      } else {
        setAiReport({ status: 'error', message: result.reason || "Rad etildi.", auditStatus: result.auditStatus });
      }
    } catch (err) {
      console.error("AI Error (Send):", err);
      setAiReport({ status: 'error', message: "Texnik xatolik." });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceipt = async (transactionId: string, biometricHash: string): Promise<boolean> => {
    try {
      const resp = await fetch('/api/confirm-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, biometricHash })
      });
      const data = await resp.json();
      if (data.success) {
        alert(data.message);
        fetchBlockchain();
        
        // AI Notification logic: "Xojayin, pul qabul qiluvchining shaxsi tasdiqlandi..."
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: `Siz Audit AI-siz. Qabul qiluvchi shaxsi tasdiqlandi. Tranzaksiya ID: ${transactionId}. Yuboruvchiga xushxabarni o'zbek tili, do'stona va professional yetkazish uchun qisqa xabar yozing.`
          });
        } catch (e) {}
        return true;
      } else {
        alert(data.message);
        return false;
      }
    } catch (err) {
      alert("Aloqa xatoligi.");
      return false;
    }
  };

  const loginAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { setRole('admin'); setPassword(''); } else { alert("Xato parol!"); }
  };

  const renderContent = () => {
    if (role === 'guest') {
      return (
        <div className="space-y-20 pb-20">
          <div className="flex flex-col items-center justify-center min-h-[45vh] space-y-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8 max-w-4xl px-6 flex flex-col items-center"
            >
              <div className="p-4 flex flex-col items-center">
                <NexusCheckLogo className="w-64 h-64" showText={true} />
              </div>
              <div className="space-y-4 mt-8">
                <div className="inline-block bg-accent-blue/10 text-accent-blue px-6 py-2 rounded-full text-sm font-black uppercase tracking-[0.3em] mb-4 border border-accent-blue/20">NexusCheck v1.1.5-beta</div>
                <p className="text-2xl text-text-secondary leading-relaxed max-w-3xl mx-auto font-medium tracking-tight">Buxgalteriya hisobini Blokcheyn va AI orqali korrupsiyadan himoya qilishning eng mukammal yechimi.</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl px-4">
              <div onClick={() => setRole('sender')} className="group p-10 bg-card-bg rounded-[48px] border border-border-color shadow-2xl hover:shadow-accent-blue/10 transition-all cursor-pointer border-b-8 border-b-accent-blue">
                <div className="w-20 h-20 bg-accent-blue/5 rounded-3xl flex items-center justify-center text-accent-blue mb-10 group-hover:bg-accent-blue group-hover:text-slate-900 transition-all border border-accent-blue/20"><Send size={40} /></div>
                <h3 className="text-3xl font-black text-text-primary mb-3 tracking-tighter">Yuboruvchi</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-8 font-medium">Mablag'larni blokcheyn orqali yuborish va biometrik muhrlash.</p>
                <div className="flex items-center gap-3 text-accent-blue font-black uppercase tracking-[0.2em] text-[10px] group-hover:gap-6 transition-all">Tizimga Kirish <ArrowRight size={20} /></div>
              </div>

              <div onClick={() => setRole('receiver')} className="group p-10 bg-card-bg rounded-[48px] border border-border-color shadow-2xl hover:shadow-accent-green/10 transition-all cursor-pointer border-b-8 border-b-accent-green">
                <div className="w-20 h-20 bg-accent-green/5 rounded-3xl flex items-center justify-center text-accent-green mb-10 group-hover:bg-accent-green group-hover:text-slate-900 transition-all border border-accent-green/20"><CheckCircle2 size={40} /></div>
                <h3 className="text-3xl font-black text-text-primary mb-3 tracking-tighter">Qabul Qiluvchi</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-8 font-medium">Mablag'larni biometrik tasdiqlash (ZKP) orqali hisobga olish.</p>
                <div className="flex items-center gap-3 text-accent-green font-black uppercase tracking-[0.2em] text-[10px] group-hover:gap-6 transition-all">Tizimga Kirish <ArrowRight size={20} /></div>
              </div>

              <div className="p-10 bg-card-bg rounded-[48px] border border-border-color shadow-2xl border-b-8 border-b-text-primary group">
                 <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-white mb-10 group-hover:rotate-12 transition-transform border border-white/5"><Lock size={40} /></div>
                    <h3 className="text-3xl font-black text-text-primary mb-8 tracking-tighter">Admin Portal</h3>
                    <div className="grid grid-cols-1 gap-4 mb-8">
                      <div className="p-6 bg-slate-800 rounded-3xl border border-white/5">
                        <div className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 opacity-50">Audit Login:</div>
                        <div className="text-sm font-black text-text-primary">admin</div>
                      </div>
                    </div>
                    <form onSubmit={loginAdmin} className="space-y-4">
                      <input type="password" placeholder="Parol: admin123" className="w-full px-6 py-4 bg-slate-800 border border-border-color rounded-2xl outline-none focus:ring-4 focus:ring-accent-blue/10 text-sm text-text-primary font-bold" value={password} onChange={e => setPassword(e.target.value)} />
                      <button type="submit" className="w-full py-5 bg-text-primary text-bg-main rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:opacity-90 transition-all shadow-2xl">Auditorn Verifikatsiya</button>
                    </form>
              </div>
            </div>
          </div>

          <div className="bg-bg-main py-24 px-4 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="max-w-7xl mx-auto">
               <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <h2 className="text-5xl font-black text-text-primary tracking-tighter mb-6">Loyiha Haqida & Brending</h2>
                  <p className="text-text-secondary max-w-2xl mx-auto font-medium leading-relaxed">Tizim qobiliyatlari va uning afzalliklari haqida batafsil ma'lumotlar. Blokcheyn va AI simbiozi orqali ochiqlik ta'minlanadi.</p>
               </div>
               <BrandingPanel />
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'dashboard' || activeTab === 'blockchain') {
      return (
        <div className="h-full space-y-8">
           <StatGrid chain={chain} />
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
              {role === 'sender' ? (
                <TransactionForm onSend={handleSendTransaction} loading={loading} aiReport={aiReport} />
              ) : (
                <div className="bg-card-bg p-12 rounded-[48px] border border-border-color shadow-2xl flex flex-col items-center justify-center text-center">
                   <div className="w-24 h-24 bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-600 mb-8 border border-white/5">
                    <ShieldCheck size={48} strokeWidth={1} />
                   </div>
                   <h3 className="text-3xl font-black text-text-primary mb-3 tracking-tight">Veb-Portal Nazorati</h3>
                   <p className="text-text-secondary text-sm max-w-sm leading-relaxed">Sizning rolingiz uchun o'tkazma yaratish imkoniyati yoqilmagan. Ma'lumotlarni kuzatish uchun o'ngdagi registrdan foydalaning.</p>
                </div>
              )}
              <BlockchainTable chain={chain} searchTerm={searchTerm} />
           </div>
        </div>
      );
    }

    if (activeTab === 'receipts') {
      return <ReceiptsPanel chain={chain} onConfirm={handleConfirmReceipt} />;
    }

    if (activeTab === 'ai-reports') {
      return <AdminPanel chain={chain} />;
    }

    if (activeTab === 'branding') {
      return <BrandingPanel />;
    }

    if (activeTab === 'violations') {
      return <ViolationsPanel chain={chain} />;
    }

    if (activeTab === 'ai-chat') {
      return <AIChatbot chain={chain} />;
    }

    return (
      <div className="flex flex-col items-center justify-center p-20 text-text-secondary">
        <Settings size={80} strokeWidth={1} className="mb-6 opacity-20 animate-spin-slow" />
        <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40 italic">Sozlamalar bo'limi hali tayyor emas</p>
      </div>
    );
  };

  return (
    <div className="flex bg-bg-main min-h-screen text-text-primary font-sans selection:bg-accent-blue/30 selection:text-white transition-colors duration-500">
      <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setRole('guest')} />
      <div className="flex-1 flex flex-col h-screen">
        <SleekHeader role={role} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <main className="flex-1 p-8 overflow-y-auto hide-scrollbar">
           <AnimatePresence mode="wait">
             <motion.div key={activeTab + role} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
               {renderContent()}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

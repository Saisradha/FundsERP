import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, Terminal } from 'lucide-react';
import { useWarehouseStore } from '../store/useWarehouseStore';

export const AiAssistantHologram: React.FC = () => {
  const { aiAssistantOpen, setAiAssistantOpen, setActiveTab } = useWarehouseStore();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Greetings. I am AURA — your Digital Warehouse OS Assistant. Query stock, navigate 3D space, or request sales stats.',
    },
  ]);

  if (!aiAssistantOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setQuery('');

    // AI Query Intent Processing
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let responseText = "I've processed your query.";

      if (lower.includes('low stock') || lower.includes('alert') || lower.includes('warning')) {
        responseText = "Switching view to Low Stock inventory filter...";
        setActiveTab('products');
      } else if (lower.includes('customer') || lower.includes('galaxy') || lower.includes('crm')) {
        responseText = "Opening 3D Customer Galaxy graph...";
        setActiveTab('customers_3d');
      } else if (lower.includes('warehouse') || lower.includes('3d') || lower.includes('shelf')) {
        responseText = "Navigating to 3D Digital Twin Warehouse...";
        setActiveTab('warehouse_3d');
      } else if (lower.includes('sales') || lower.includes('challan') || lower.includes('dispatch')) {
        responseText = "Opening Sales Challan Dispatch Center...";
        setActiveTab('challans');
      } else {
        responseText = `Acknowledged: "${userText}". All warehouse telemetry systems operating at peak nominal capacity.`;
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: responseText }]);
    }, 600);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-6 right-6 z-50 w-96 glass-panel rounded-2xl border-cyan-400/40 shadow-[0_0_40px_rgba(6,182,212,0.3)] backdrop-blur-2xl overflow-hidden font-sans"
      >
        {/* Hologram Header */}
        <div className="p-4 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono tracking-wider flex items-center gap-1.5">
                <span>AURA AI ASSISTANT</span>
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-[10px] font-mono text-cyan-400">Holographic Neural Interface</div>
            </div>
          </div>

          <button
            onClick={() => setAiAssistantOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History Messages */}
        <div className="p-4 h-64 overflow-y-auto space-y-3 text-xs font-mono">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl border ${
                  m.sender === 'user'
                    ? 'bg-cyan-600/30 border-cyan-500/50 text-cyan-100'
                    : 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-inner'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Query Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type query or command..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import { Input } from "@/components/ui/input";
import NewsSentimentPanel from '../components/sentiment/NewsSentimentPanel';

export default function NewsSentimentPage() {
  const [symbol, setSymbol] = useState('');
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Newspaper className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">AI News Sentiment</h1>
          </div>
          <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Filter by symbol" className="w-full md:w-64 bg-slate-800 border-slate-600 text-white" />
        </motion.div>
        <NewsSentimentPanel symbol={symbol} />
      </div>
    </div>
  );
}
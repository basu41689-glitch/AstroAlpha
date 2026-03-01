import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import PortfolioAnalyzer from '../components/portfolio/PortfolioAnalyzer';

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Briefcase className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">AI Portfolio Analyzer</h1>
            <p className="text-slate-400">Real-time P&L tracking with AI-powered insights</p>
          </div>
        </motion.div>
        <PortfolioAnalyzer />
      </div>
    </div>
  );
}
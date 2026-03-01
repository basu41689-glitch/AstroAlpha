import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, Target, RefreshCw, Brain } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export default function PortfolioAnalyzer() {
  const [holdings, setHoldings] = useState([
    { symbol: 'RELIANCE', quantity: 10, avgPrice: 2380, currentPrice: 2450 },
    { symbol: 'TCS', quantity: 5, avgPrice: 3750, currentPrice: 3890 },
    { symbol: 'HDFCBANK', quantity: 20, avgPrice: 1580, currentPrice: 1625 },
  ]);
  const [newHolding, setNewHolding] = useState({ symbol: '', quantity: '', avgPrice: '' });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const totalInvestment = holdings.reduce((s, h) => s + h.quantity * h.avgPrice, 0);
  const currentValue = holdings.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
  const totalPnL = currentValue - totalInvestment;

  const analyzePortfolio = async () => {
    setIsAnalyzing(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this Indian stock portfolio: ${holdings.map(h => `${h.symbol}: ${h.quantity} shares @ ₹${h.avgPrice}`).join(', ')}. Give health score, risk, recommendations.`,
      response_json_schema: { type: 'object', properties: { health_score: { type: 'number' }, risk_level: { type: 'string' }, summary: { type: 'string' }, recommendations: { type: 'array', items: { type: 'string' } } } }
    });
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Investment', value: `₹${totalInvestment.toLocaleString()}`, icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-500/20' },
          { label: 'Current Value', value: `₹${currentValue.toLocaleString()}`, icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/20' },
          { label: 'Total P&L', value: `${totalPnL >= 0 ? '+' : ''}₹${totalPnL.toLocaleString()}`, icon: totalPnL >= 0 ? TrendingUp : TrendingDown, color: totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400', bg: totalPnL >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20' },
          { label: 'Returns', value: `${((totalPnL / totalInvestment) * 100).toFixed(2)}%`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/20' },
        ].map(m => (
          <Card key={m.label} className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${m.bg}`}><m.icon className={`w-5 h-5 ${m.color}`} /></div>
              <div><p className="text-xs text-slate-400">{m.label}</p><p className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button onClick={analyzePortfolio} disabled={isAnalyzing} className="bg-violet-600 hover:bg-violet-700">
        {isAnalyzing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
        AI Analyze Portfolio
      </Button>
      {aiAnalysis && (
        <Card className="bg-slate-900/50 border-violet-500/20">
          <CardContent className="p-4">
            <p className="font-semibold text-white mb-2">AI Analysis - Score: {aiAnalysis.health_score}/100</p>
            <p className="text-slate-300 text-sm">{aiAnalysis.summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { LineChart, Line, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Zap, TrendingUp, BarChart3, RefreshCw, Brain, DollarSign, Activity } from 'lucide-react';
import { cn } from "@src/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

const STRATEGY_COLORS = {
  'call': '#3b82f6',
  'put': '#ef4444',
  'spread': '#8b5cf6',
  'straddle': '#10b981',
  'iron_condor': '#f59e0b'
};

export default function OptionsAnalyzer() {
  const [options, setOptions] = useState([
    { type: 'call', strike: 2500, premium: 45, quantity: 1, expiry: '2026-03-15', underlyingPrice: 2450, description: 'ATM Call RELIANCE' },
    { type: 'put', strike: 2400, premium: 38, quantity: 1, expiry: '2026-03-15', underlyingPrice: 2450, description: 'OTM Put RELIANCE' },
  ]);
  const [newOption, setNewOption] = useState({ type: 'call', strike: '', premium: '', quantity: '', expiry: '', underlyingPrice: '' });
  const [optionsAnalysis, setOptionsAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Greeks calculation (simplified Black-Scholes approximation)
  const calculateGreeks = (opt) => {
    const S = opt.underlyingPrice;
    const K = opt.strike;
    const r = 0.065; // Risk-free rate
    const sigma = 0.25; // Volatility
    const T = 0.04; // Time to expiry (approx days/365)
    
    const moneyness = S / K;
    const intrinsicValue = opt.type === 'call' 
      ? Math.max(S - K, 0) 
      : Math.max(K - S, 0);
    
    const timeValue = opt.premium - intrinsicValue;
    
    // Simplified Delta
    const delta = opt.type === 'call' 
      ? Math.min(Math.max(moneyness - 0.5, 0), 1)
      : Math.min(Math.max(moneyness - 1.5, -1), 0);
    
    // Simplified Gamma, Theta, Vega
    const gamma = 0.02;
    const theta = opt.type === 'call' ? -0.05 : -0.03;
    const vega = 0.15;
    
    return { intrinsicValue, timeValue, delta, gamma, theta, vega };
  };

  const optionsWithGreeks = options.map(opt => ({
    ...opt,
    greeks: calculateGreeks(opt),
    notional: opt.strike * opt.quantity * 100, // Options are typically 100 shares per contract
    maxProfit: opt.type === 'call' ? Infinity : opt.strike * opt.quantity * 100 - opt.premium * opt.quantity * 100,
    maxLoss: opt.type === 'call' ? opt.premium * opt.quantity * 100 : (opt.strike - opt.premium) * opt.quantity * 100,
  }));

  const totalInvestment = optionsWithGreeks.reduce((s, o) => s + (o.premium * o.quantity * 100), 0);
  const totalGreeksDelta = optionsWithGreeks.reduce((s, o) => s + (o.greeks.delta * o.quantity * o.strike * 100), 0);
  const totalGreeksGamma = optionsWithGreeks.reduce((s, o) => s + (o.greeks.gamma * o.quantity), 0);
  const totalGreeksTheta = optionsWithGreeks.reduce((s, o) => s + (o.greeks.theta * o.quantity * 100), 0);

  const analyzeOptions = async () => {
    setIsAnalyzing(true);
    // Local heuristic options analysis
    const netDelta = totalGreeksDelta;
    const strategy_type = netDelta > 0 ? 'Bullish Options Mix' : netDelta < 0 ? 'Bearish Options Mix' : 'Neutral/Spread Strategy';
    const market_bias = netDelta > 0.5 ? 'Bullish' : netDelta < -0.5 ? 'Bearish' : 'Neutral';
    const risk_reward_ratio = totalInvestment > 50000 ? 'Balanced' : 'Conservative';
    const best_case = 'Underlying moves in line with bias, options realize time value and intrinsic gains.';
    const worst_case = 'Underlying moves against bias leading to premium loss or margin requirements.';
    const exit_strategies = ['Close positions on 50% profit', 'Roll options forward if near expiry and still directional', 'Hedge with opposite positions for large adverse moves'];
    const adjustments = ['Reduce size', 'Increase hedges via spreads', 'Tighten stop-loss criteria'];
    setOptionsAnalysis({ strategy_type, market_bias, risk_reward_ratio, best_case, worst_case, exit_strategies, adjustments });
    setIsAnalyzing(false);
  };

  const addOption = () => {
    if (newOption.type && newOption.strike && newOption.premium && newOption.quantity && newOption.underlyingPrice) {
      setOptions([...options, {
        ...newOption,
        strike: parseFloat(newOption.strike),
        premium: parseFloat(newOption.premium),
        quantity: parseInt(newOption.quantity),
        underlyingPrice: parseFloat(newOption.underlyingPrice),
        description: `${newOption.type.toUpperCase()} ${newOption.strike}`
      }]);
      setNewOption({ type: 'call', strike: '', premium: '', quantity: '', expiry: '', underlyingPrice: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Premium', value: `₹${totalInvestment.toLocaleString()}`, icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-500/20' },
          { label: 'Portfolio Delta', value: totalGreeksDelta.toFixed(2), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20' },
          { label: 'Total Gamma', value: totalGreeksGamma.toFixed(4), icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/20' },
          { label: 'Daily Theta Decay', value: `₹${totalGreeksTheta.toLocaleString()}`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
        ].map(m => (
          <Card key={m.label} className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${m.bg}`}><m.icon className={`w-5 h-5 ${m.color}`} /></div>
              <div><p className="text-xs text-slate-400">{m.label}</p><p className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-yellow-400" /> Options Greeks Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {optionsWithGreeks.map((opt, idx) => (
            <div key={idx} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-white">{opt.description}</p>
                  <p className="text-sm text-slate-400">Strike: ₹{opt.strike} | Premium: ₹{opt.premium} | Qty: {opt.quantity}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${opt.type === 'call' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                  {opt.type}
                </span>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                <div className="bg-slate-800/50 p-2 rounded">
                  <p className="text-slate-400">Delta</p>
                  <p className="font-semibold text-green-400">{opt.greeks.delta.toFixed(3)}</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded">
                  <p className="text-slate-400">Gamma</p>
                  <p className="font-semibold text-blue-400">{opt.greeks.gamma.toFixed(4)}</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded">
                  <p className="text-slate-400">Theta</p>
                  <p className="font-semibold text-yellow-400">{opt.greeks.theta.toFixed(3)}</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded">
                  <p className="text-slate-400">Vega</p>
                  <p className="font-semibold text-purple-400">{opt.greeks.vega.toFixed(3)}</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded">
                  <p className="text-slate-400">Intrinsic</p>
                  <p className="font-semibold text-white">₹{opt.greeks.intrinsicValue.toFixed(0)}</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded">
                  <p className="text-slate-400">Time Value</p>
                  <p className="font-semibold text-white">₹{opt.greeks.timeValue.toFixed(0)}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Add Option</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <select value={newOption.type} onChange={(e) => setNewOption({...newOption, type: e.target.value})} className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white">
                <option value="call">Call</option>
                <option value="put">Put</option>
              </select>
            </div>
            <Input placeholder="Strike Price" type="number" value={newOption.strike} onChange={(e) => setNewOption({...newOption, strike: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Premium" type="number" value={newOption.premium} onChange={(e) => setNewOption({...newOption, premium: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Quantity" type="number" value={newOption.quantity} onChange={(e) => setNewOption({...newOption, quantity: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Underlying Price" type="number" value={newOption.underlyingPrice} onChange={(e) => setNewOption({...newOption, underlyingPrice: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
            <Button onClick={addOption} className="w-full bg-yellow-600 hover:bg-yellow-700">Add Option</Button>
          </CardContent>
        </Card>
      </div>

      <Button onClick={analyzeOptions} disabled={isAnalyzing} className="bg-yellow-600 hover:bg-yellow-700 w-full">
        {isAnalyzing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
        AI Analyze Strategy
      </Button>

      <AnimatePresence>
        {optionsAnalysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <Card className="bg-slate-900/50 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Brain className="w-5 h-5 text-yellow-400" /> AI Options Strategy Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <p className="text-sm text-slate-400 mb-1">Strategy Type</p>
                    <p className="font-semibold text-white">{optionsAnalysis.strategy_type}</p>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <p className="text-sm text-slate-400 mb-1">Market Bias</p>
                    <p className="font-semibold text-white">{optionsAnalysis.market_bias}</p>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <p className="text-sm text-slate-400 mb-1">Risk/Reward</p>
                    <p className="font-semibold text-white">{optionsAnalysis.risk_reward_ratio}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Best Case Scenario</p>
                    <p className="text-sm text-slate-300 p-2 bg-slate-800/30 rounded">{optionsAnalysis.best_case}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Worst Case Scenario</p>
                    <p className="text-sm text-slate-300 p-2 bg-slate-800/30 rounded">{optionsAnalysis.worst_case}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Exit Strategies</p>
                  <ul className="list-disc list-inside space-y-1">
                    {optionsAnalysis.exit_strategies?.map((strat, i) => (
                      <li key={i} className="text-sm text-slate-300">{strat}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

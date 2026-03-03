import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { LineChart, Line, BarChart, Bar, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertCircle, TrendingDown, AlertTriangle, RefreshCw, Brain, Percent, DollarSign, Activity } from 'lucide-react';
import { cn } from "@src/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

const RISK_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#a21caf'
};

export default function AIRiskCalculator() {
  const [positions, setPositions] = useState([
    { symbol: 'RELIANCE', quantity: 10, currentPrice: 2450, stopLoss: 2300, beta: 1.2 },
    { symbol: 'TCS', quantity: 5, currentPrice: 3890, stopLoss: 3600, beta: 1.1 },
    { symbol: 'HDFCBANK', quantity: 20, currentPrice: 1625, stopLoss: 1500, beta: 1.3 },
  ]);
  const [newPosition, setNewPosition] = useState({ symbol: '', quantity: '', currentPrice: '', stopLoss: '', beta: '' });
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const calculateRisks = () => {
    return positions.map(pos => {
      const investment = pos.quantity * pos.currentPrice;
      const potentialLoss = pos.quantity * (pos.currentPrice - pos.stopLoss);
      const riskPercent = (potentialLoss / investment) * 100;
      const var95 = investment * pos.beta * 0.0196; // VaR calculation approximation
      
      return {
        ...pos,
        investment,
        potentialLoss,
        riskPercent,
        var95,
        riskLevel: riskPercent < 5 ? 'low' : riskPercent < 15 ? 'medium' : riskPercent < 25 ? 'high' : 'critical'
      };
    });
  };

  const risks = calculateRisks();
  const totalInvestment = risks.reduce((s, r) => s + r.investment, 0);
  const totalPotentialLoss = risks.reduce((s, r) => s + r.potentialLoss, 0);
  const portfolioRiskPercent = (totalPotentialLoss / totalInvestment) * 100;
  const totalVaR = risks.reduce((s, r) => s + r.var95, 0);

  const analyzeRisk = async () => {
    setIsAnalyzing(true);
    // Local heuristic-based analysis replacing external LLM call
    const overall_risk_rating = portfolioRiskPercent > 25 ? 'HIGH' : portfolioRiskPercent > 15 ? 'MEDIUM' : 'LOW';
    const concentration_risk = risks.length > 0 && (Math.max(...risks.map(r => r.investment)) / totalInvestment) > 0.3 ? 'HIGH' : 'LOW';
    const systematic_risk = 'MODERATE';
    const hedging_suggestions = ['Consider protective puts on large positions', 'Reduce concentration in single-name holdings', 'Use stop-loss orders to limit downside'];
    const position_recommendations = risks.map(r => `${r.symbol}: consider ${r.riskLevel === 'high' ? 'reducing' : 'holding'}`);
    setRiskAnalysis({ overall_risk_rating, concentration_risk, systematic_risk, hedging_suggestions, position_recommendations });
    setIsAnalyzing(false);
  };

  const addPosition = () => {
    if (newPosition.symbol && newPosition.quantity && newPosition.currentPrice && newPosition.stopLoss) {
      setPositions([...positions, { ...newPosition, quantity: parseInt(newPosition.quantity), currentPrice: parseFloat(newPosition.currentPrice), stopLoss: parseFloat(newPosition.stopLoss), beta: parseFloat(newPosition.beta) || 1 }]);
      setNewPosition({ symbol: '', quantity: '', currentPrice: '', stopLoss: '', beta: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Investment', value: `₹${totalInvestment.toLocaleString()}`, icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-500/20' },
          { label: 'Max Daily Loss', value: `₹${totalPotentialLoss.toLocaleString()}`, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/20' },
          { label: 'Risk %', value: `${portfolioRiskPercent.toFixed(2)}%`, icon: Percent, color: portfolioRiskPercent > 15 ? 'text-orange-400' : 'text-yellow-400', bg: portfolioRiskPercent > 15 ? 'bg-orange-500/20' : 'bg-yellow-500/20' },
          { label: 'Value at Risk (95%)', value: `₹${totalVaR.toLocaleString()}`, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/20' },
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
          <CardTitle className="text-white flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-400" /> Risk by Position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {risks.map(risk => (
            <div key={risk.symbol} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <div className="flex-1">
                <p className="font-semibold text-white">{risk.symbol}</p>
                <p className="text-sm text-slate-400">{risk.quantity} shares @ ₹{risk.currentPrice}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Max Loss</p>
                  <p className="font-semibold text-red-400">₹{risk.potentialLoss.toLocaleString()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full ${RISK_COLORS[risk.riskLevel] === '#10b981' ? 'bg-green-500/20 text-green-400' : RISK_COLORS[risk.riskLevel] === '#f59e0b' ? 'bg-yellow-500/20 text-yellow-400' : RISK_COLORS[risk.riskLevel] === '#ef4444' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'} text-xs font-semibold`}>
                  {risk.riskPercent.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Add Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Stock Symbol" value={newPosition.symbol} onChange={(e) => setNewPosition({...newPosition, symbol: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Quantity" type="number" value={newPosition.quantity} onChange={(e) => setNewPosition({...newPosition, quantity: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Current Price" type="number" value={newPosition.currentPrice} onChange={(e) => setNewPosition({...newPosition, currentPrice: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Stop Loss Price" type="number" value={newPosition.stopLoss} onChange={(e) => setNewPosition({...newPosition, stopLoss: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
            <Input placeholder="Beta (default 1)" type="number" value={newPosition.beta} onChange={(e) => setNewPosition({...newPosition, beta: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
            <Button onClick={addPosition} className="w-full bg-orange-600 hover:bg-orange-700">Add Position</Button>
          </CardContent>
        </Card>
      </div>

      <Button onClick={analyzeRisk} disabled={isAnalyzing} className="bg-orange-600 hover:bg-orange-700 w-full">
        {isAnalyzing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
        AI Analyze Risk Profile
      </Button>

      <AnimatePresence>
        {riskAnalysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <Card className="bg-slate-900/50 border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Brain className="w-5 h-5 text-orange-400" /> AI Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <p className="text-sm text-slate-400 mb-1">Overall Risk Rating</p>
                    <p className="font-semibold text-white">{riskAnalysis.overall_risk_rating}</p>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <p className="text-sm text-slate-400 mb-1">Concentration Risk</p>
                    <p className="font-semibold text-white">{riskAnalysis.concentration_risk}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Hedging Suggestions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {riskAnalysis.hedging_suggestions?.map((sugg, i) => (
                      <li key={i} className="text-sm text-slate-300">{sugg}</li>
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

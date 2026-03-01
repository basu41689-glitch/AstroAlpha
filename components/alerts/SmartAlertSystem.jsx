import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Plus, Trash2, Target, Shield, Zap, Volume2, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ALERT_TYPES = [
  { id: 'PRICE_TARGET', name: 'Price Target', icon: Target, color: 'text-emerald-400' },
  { id: 'STOP_LOSS', name: 'Stop Loss', icon: Shield, color: 'text-red-400' },
  { id: 'SIGNAL_CHANGE', name: 'AI Signal Change', icon: Zap, color: 'text-violet-400' },
  { id: 'VOLUME_SPIKE', name: 'Volume Spike', icon: Volume2, color: 'text-blue-400' },
  { id: 'PRE_MARKET', name: 'Pre-Market Alert', icon: Clock, color: 'text-amber-400' },
];

export default function SmartAlertSystem() {
  const [newAlert, setNewAlert] = useState({ stock_symbol: '', alert_type: 'PRICE_TARGET', target_value: '', condition: '' });
  const queryClient = useQueryClient();
  const { data: alerts = [], isLoading } = useQuery({ queryKey: ['alerts'], queryFn: () => base44.entities.Alert.list('-created_date', 50) });
  const createAlertMutation = useMutation({ mutationFn: (data) => base44.entities.Alert.create(data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }) });
  const deleteAlertMutation = useMutation({ mutationFn: (id) => base44.entities.Alert.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }) });
  const updateAlertMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.Alert.update(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }) });

  const handleCreateAlert = () => {
    if (newAlert.stock_symbol && newAlert.alert_type) {
      createAlertMutation.mutate({ ...newAlert, target_value: Number(newAlert.target_value) || 0, is_active: true, is_triggered: false });
      setNewAlert({ stock_symbol: '', alert_type: 'PRICE_TARGET', target_value: '', condition: '' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader className="border-b border-slate-700/50">
          <CardTitle className="text-white flex items-center gap-2"><Plus className="w-5 h-5 text-blue-400" />Create New Alert</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-400">Stock Symbol</Label>
              <Input value={newAlert.stock_symbol} onChange={(e) => setNewAlert({ ...newAlert, stock_symbol: e.target.value.toUpperCase() })} placeholder="e.g., RELIANCE" className="bg-slate-800 border-slate-600 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Alert Type</Label>
              <Select value={newAlert.alert_type} onValueChange={(v) => setNewAlert({ ...newAlert, alert_type: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {ALERT_TYPES.map(type => (<SelectItem key={type.id} value={type.id} className="text-white">{type.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Target Value (₹)</Label>
              <Input type="number" value={newAlert.target_value} onChange={(e) => setNewAlert({ ...newAlert, target_value: e.target.value })} placeholder="e.g., 2500" className="bg-slate-800 border-slate-600 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">&nbsp;</Label>
              <Button onClick={handleCreateAlert} className="w-full bg-gradient-to-r from-blue-600 to-purple-600"><Plus className="w-4 h-4 mr-2" />Create Alert</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
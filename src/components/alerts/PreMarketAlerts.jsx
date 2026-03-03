import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';

export default function PreMarketAlerts() {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Pre-Market Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 text-sm">No alerts at this time</p>
      </CardContent>
    </Card>
  );
}

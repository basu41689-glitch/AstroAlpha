import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AIInsightCard() {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white">AI Market Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 text-sm">AI analysis and insights will appear here</p>
      </CardContent>
    </Card>
  );
}

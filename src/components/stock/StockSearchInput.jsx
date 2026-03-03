import React, { useState } from 'react';
import Input from '../ui/input';
import Button from '../ui/button';
import { Search } from 'lucide-react';

export default function StockSearchInput({ onSearch }) {
  const [symbol, setSymbol] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSearch(symbol.trim().toUpperCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="Enter stock symbol (e.g. RELIANCE)"
        className="flex-1"
      />
      <Button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
        <Search className="w-4 h-4 mr-1" />Search
      </Button>
    </form>
  );
}
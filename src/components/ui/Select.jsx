import React, { useState } from 'react';
import { cn } from "@src/lib/utils";
import { ChevronDown } from 'lucide-react';

const Select = ({ children, value, onValueChange }) => {
  return (
    <div className="relative">
      {React.Children.map(children, child =>
        React.cloneElement(child, { value, onValueChange })
      )}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-lg border border-slate-600/50 bg-slate-700/50 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
));

SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }) => (
  <span className="text-slate-300">{placeholder}</span>
);

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute top-full left-0 z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg",
      className
    )}
    {...props}
  >
    {children}
  </div>
));

SelectContent.displayName = "SelectContent";

const SelectItem = ({ value, onValueChange, children, ...props }) => (
  <div
    onClick={() => onValueChange && onValueChange(value)}
    className="px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer"
    {...props}
  >
    {children}
  </div>
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };

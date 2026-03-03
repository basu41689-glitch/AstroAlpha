import React, { useState } from 'react';
import { cn } from "@src/lib/utils";

const Tabs = ({ children, defaultValue, onValueChange }) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (newValue) => {
    setValue(newValue);
    onValueChange && onValueChange(newValue);
  };

  return (
    <div>
      {React.Children.map(children, child =>
        React.cloneElement(child, { value, onValueChange: handleChange })
      )}
    </div>
  );
};

const TabsList = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg border border-slate-700/50 bg-slate-800/50 p-1",
      className
    )}
    {...props}
  >
    {children}
  </div>
));

TabsList.displayName = "TabsList";

const TabsTrigger = ({ value, onValueChange, children, className, ...props }) => (
  <button
    onClick={() => onValueChange(value)}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all",
      "text-slate-400 hover:text-slate-300",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children, className, ...props }) => (
  <div className={cn("mt-2", className)} {...props}>
    {children}
  </div>
);

export { Tabs, TabsList, TabsTrigger, TabsContent };

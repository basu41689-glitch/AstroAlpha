// UI Input Component
// Text input field
import React from 'react';
import { cn } from "@src/lib/utils";

const Input = React.forwardRef(({ 
  className, 
  type = "text",
  placeholder,
  disabled = false,
  ...props 
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "w-full px-4 py-2 rounded-lg border border-slate-600/50 bg-slate-700/50 text-white placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
export default Input;

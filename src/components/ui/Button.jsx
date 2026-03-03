// UI Button Component
// Reusable button with variants and sizes
import React from 'react';
import { cn } from "@src/lib/utils";

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "md",
  disabled = false,
  children,
  ...props 
}, ref) => {
  const variants = {
    default: "bg-violet-600 hover:bg-violet-700 text-white",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    ghost: "hover:bg-slate-800 text-slate-400 hover:text-white",
    outline: "border border-slate-700 hover:bg-slate-800 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    icon: "p-2",
  };

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;

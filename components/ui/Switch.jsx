import React from 'react';
import { cn } from "@src/lib/utils";

const Switch = React.forwardRef(({ className, checked, onChange, ...props }, ref) => (
  <button
    ref={ref}
    role="switch"
    aria-checked={checked}
    onClick={() => onChange && onChange(!checked)}
    className={cn(
      "inline-flex h-6 w-11 items-center rounded-full transition-colors",
      checked ? "bg-violet-600" : "bg-slate-700",
      "hover:opacity-80",
      className
    )}
    {...props}
  >
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
        checked ? "translate-x-6" : "translate-x-1"
      )}
    />
  </button>
));

Switch.displayName = "Switch";
export default Switch;

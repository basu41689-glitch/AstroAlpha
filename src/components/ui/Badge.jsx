import React from 'react';
import { cn } from "@src/lib/utils";

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      variant === "default" && "bg-slate-700 text-slate-200",
      variant === "success" && "bg-green-500/20 text-green-500",
      variant === "warning" && "bg-yellow-500/20 text-yellow-500",
      variant === "danger" && "bg-red-500/20 text-red-500",
      className
    )}
    {...props}
  />
));

Badge.displayName = "Badge";
export default Badge;

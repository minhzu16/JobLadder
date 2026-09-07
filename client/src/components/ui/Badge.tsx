import * as React from "react"
import { cn } from "@/utils/cn"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'purple' | 'cyan' | 'orange' | 'green' | 'default';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          'bg-purple-500/20 text-purple-400 border border-purple-500/30': variant === 'purple',
          'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30': variant === 'cyan',
          'bg-orange-500/20 text-orange-400 border border-orange-500/30': variant === 'orange',
          'bg-green-500/20 text-green-400 border border-green-500/30': variant === 'green',
          'bg-white/10 text-gray-300 border border-white/20': variant === 'default',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }

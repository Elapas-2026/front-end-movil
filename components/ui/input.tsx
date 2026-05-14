import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-slate-500 selection:bg-primary selection:text-primary-foreground border-slate-300 h-11 w-full min-w-0 rounded-2xl border bg-white/95 px-3 py-2 text-base text-slate-900 shadow-sm shadow-slate-200 transition duration-200 ease-in-out outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70 md:text-sm',
        'focus-visible:border-primary focus-visible:ring-primary/40 focus-visible:ring-2',
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }

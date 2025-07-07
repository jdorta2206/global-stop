"use client"

import React from "react"
import { Circle } from "lucide-react"

// Función cn inline para evitar dependencia de @/lib/utils
const cn = (...classes: (string | undefined)[]) => {
 return classes.filter(Boolean).join(' ')
}

interface RadioGroupProps {
 className?: string
 value?: string
 onValueChange?: (value: string) => void
 children: React.ReactNode
 disabled?: boolean
}

interface RadioGroupItemProps {
 className?: string
 value: string
 disabled?: boolean
 id?: string
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
 ({ className, value, onValueChange, children, disabled, ...props }, ref) => {
   return (
     <div
       ref={ref}
       className={cn("grid gap-2", className)}
       role="radiogroup"
       {...props}
     >
       {React.Children.map(children, (child) => {
         if (React.isValidElement(child)) {
           return React.cloneElement(child, {
             ...child.props,
             checked: child.props.value === value,
             onChange: () => onValueChange?.(child.props.value),
             disabled: disabled || child.props.disabled,
           })
         }
         return child
       })}
     </div>
   )
 }
)

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
 ({ className, value, disabled, id, ...props }, ref) => {
   const [checked, setChecked] = React.useState(false)

   return (
     <div className="relative inline-flex items-center">
       <input
         ref={ref}
         type="radio"
         id={id}
         value={value}
         checked={checked}
         onChange={(e) => setChecked(e.target.checked)}
         disabled={disabled}
         className="sr-only"
         {...props}
       />
       <div
         className={cn(
           "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center",
           checked ? "bg-primary" : "bg-background",
           disabled ? "opacity-50 cursor-not-allowed" : "",
           className
         )}
         onClick={() => !disabled && setChecked(true)}
       >
         {checked && <Circle className="h-2.5 w-2.5 fill-current text-current" />}
       </div>
     </div>
   )
 }
)

RadioGroup.displayName = "RadioGroup"
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
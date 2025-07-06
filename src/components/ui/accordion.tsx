"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

const Accordion = AccordionPrimitive.Root

// Tipos personalizados con children explícito
type AccordionItemProps = {
  className?: string
  children: React.ReactNode
  value: string
} & React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>

type AccordionTriggerComponentProps = {
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>, 'children'>

type AccordionContentComponentProps = {
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>, 'children'>

// Implementación de los componentes
const AccordionItem = React.forwardRef<
  HTMLDivElement,
  AccordionItemProps
>(({ className, children, value, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    value={value}
    className={`border-b ${className || ''}`}
    {...props}
  >
    {children}
  </AccordionPrimitive.Item>
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerComponentProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 ${className || ''}`}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentComponentProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={`overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down ${className || ''}`}
    {...props}
  >
    <div className={`pb-4 pt-0 ${className || ''}`}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
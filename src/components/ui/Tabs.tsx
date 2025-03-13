import React from 'react';
import { cn } from '../../lib/utils';

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('overflow-x-auto', className)}
      {...props}
    />
  )
);
Tabs.displayName = 'Tabs';

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1',
        className
      )}
      role="tablist"
      {...props}
    />
  )
);
TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, isActive, ...props }, ref) => (
    <button
      ref={ref}
      role="tab"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-900',
        className
      )}
      {...props}
    />
  )
);
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, isActive, ...props }, ref) => (
    <div
      ref={ref}
      role="tabpanel"
      className={cn(
        'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
        !isActive && 'hidden',
        className
      )}
      {...props}
    />
  )
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
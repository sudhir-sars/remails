import * as React from 'react';
import { cn } from '@/lib/utils'; // Replace with actual utility function or import path
import {
  Dialog as RadixDialog,
  DialogTrigger as RadixDialogTrigger,
  DialogContent as RadixDialogContent,
  DialogClose as RadixDialogClose,
  DialogHeader as RadixDialogHeader,
  DialogFooter as RadixDialogFooter,
  DialogTitle as RadixDialogTitle,
  DialogDescription as RadixDialogDescription,
  DialogOverlay as RadixDialogOverlay,
} from '@radix-ui/react-dialog'; // Replace with actual import path

// Main Dialog Root Component
const Dialog = RadixDialog;
const DialogTrigger = RadixDialogTrigger;
const DialogClose = RadixDialogClose;
const DialogHeader = RadixDialogHeader;
const DialogFooter = RadixDialogFooter;
const DialogTitle = RadixDialogTitle;
const DialogDescription = RadixDialogDescription;

// Define interface for props
interface DialogOverlayProps
  extends React.ComponentPropsWithoutRef<typeof RadixDialogOverlay> {
  className?: string;
}

// Forward ref component with proper props type
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof RadixDialogOverlay>,
  DialogOverlayProps
>(({ className, ...props }, ref) => (
  <RadixDialogOverlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 animate-in fade-in-0 animate-out fade-out-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

// Define interface for props
interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof RadixDialogContent> {
  className?: string;
}

// Forward ref component with proper props type
const DialogContent = React.forwardRef<
  React.ElementRef<typeof RadixDialogContent>,
  DialogContentProps
>(({ className, ...props }, ref) => (
  <RadixDialogContent
    ref={ref}
    className={cn(
      'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 animate-out fade-out-0 zoom-out-95 zoom-in-95 slide-out-to-left-1/2 slide-out-to-top-[48%] slide-in-from-left-1/2 slide-in-from-top-[48%] sm:rounded-lg',
      className
    )}
    {...props}
  />
));
DialogContent.displayName = 'DialogContent';

// Export all components
export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
  DialogContent,
};

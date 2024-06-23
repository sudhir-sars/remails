import React, { useState, useRef } from 'react';

export function useDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  function trigger() {
    setIsOpen(true);
  }
  function dismiss() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }
  return {
    triggerProps: {
      ref: triggerRef,
      onClick: trigger,
    },
    dialogProps: {
      open: isOpen,
      onOpenChange: (open: boolean) => {
        if (open) trigger();
        else dismiss();
      },
    },
    trigger,
    dismiss,
  };
}

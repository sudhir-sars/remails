import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { getHandler, PlateElement } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';

export const MentionInputElement = withRef<
  typeof PlateElement,
  {
    onClick?: (mentionNode: any) => void;
  }
>(({ className, onClick, ...props }, ref) => {
  const { children, element } = props;

  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement
      ref={ref}
      asChild
      data-slate-value={element.value}
      className={cn(
        'inline-block rounded-md bg-muted px-2 py-0.5 align-baseline text-xs',
        selected && focused && 'ring-1 ring-ring',
        className
      )}
      onClick={getHandler(onClick, element)}
      {...props}
    >
      <span>{children}</span>
    </PlateElement>
  );
});

import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cn, withRef } from '@udecode/cn';
import {
  comboboxActions,
  ComboboxContentItemProps,
  ComboboxContentProps,
  ComboboxProps,
  useActiveComboboxStore,
  useComboboxContent,
  useComboboxContentState,
  useComboboxControls,
  useComboboxItem,
  useComboboxSelectors,
} from '@udecode/plate-combobox';
import {
  useEditorRef,
  useEditorSelector,
  useEventEditorSelectors,
  usePlateSelectors,
} from '@udecode/plate-common';
import { createVirtualRef } from '@udecode/plate-floating';
import { ScrollArea } from '@/components/ui/scroll-area';

export const ComboboxItem = withRef<'div', ComboboxContentItemProps>(
  ({ combobox, index, item, onRenderItem, className, ...rest }, ref) => {
    const { props } = useComboboxItem({ item, index, combobox, onRenderItem });

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-7 text-xs cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors',
          'hover:bg-accent hover:text-accent-foreground data-[highlighted=true]:bg-accent data-[highlighted=true]:text-accent-foreground',
          className
        )}
        {...props}
        {...rest}
      />
    );
  }
);

export function ComboboxContent(props: ComboboxContentProps) {
  const {
    component: Component,
    items,
    portalElement,
    combobox,
    onRenderItem,
  } = props;

  const editor = useEditorRef();
  const filteredItems = useComboboxSelectors.filteredItems();
  const activeComboboxStore = useActiveComboboxStore()!;
  const state = useComboboxContentState({ items, combobox });
  const { menuProps, targetRange } = useComboboxContent(state);

  // Calculate the height for the scroll area based on the number of items
  const maxVisibleItems = 5;
  const height = filteredItems.length <= maxVisibleItems ? 'auto' : '200px'; // Adjust height as needed

  return (
    <Popover.Root open>
      <Popover.PopoverAnchor
        virtualRef={createVirtualRef(editor, targetRange ?? undefined)}
      />

      <Popover.Portal container={portalElement}>
        <Popover.Content
          {...menuProps}
          sideOffset={5}
          side="bottom"
          align="start"
          className={cn(
            'z-[500] m-0 rounded-md bg-popover p-1 py-3 border shadow-lg'
          )}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          {Component ? Component({ store: activeComboboxStore }) : null}
          <ScrollArea className="w-[200px] rounded-md" style={{ height }}>
            {filteredItems.map((item, index) => (
              <ComboboxItem
                key={item.key}
                item={item}
                combobox={combobox}
                index={index}
                onRenderItem={onRenderItem}
              />
            ))}
          </ScrollArea>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function Combobox({
  id,
  trigger,
  searchPattern,
  onSelectItem,
  controlled,
  maxSuggestions,
  filter,
  sort,
  disabled: _disabled,
  ...props
}: ComboboxProps) {
  const storeItems = useComboboxSelectors.items();
  const disabled =
    _disabled ?? (storeItems.length === 0 && !props.items?.length);

  const focusedEditorId = useEventEditorSelectors.focus?.();
  const combobox = useComboboxControls();
  const activeId = useComboboxSelectors.activeId();
  const selectionDefined = useEditorSelector(
    (editor) => !!editor.selection,
    []
  );
  const editorId = usePlateSelectors().id();

  React.useEffect(() => {
    comboboxActions.setComboboxById({
      id,
      trigger,
      searchPattern,
      controlled,
      onSelectItem,
      maxSuggestions,
      filter,
      sort,
    });
  }, [
    id,
    trigger,
    searchPattern,
    controlled,
    onSelectItem,
    maxSuggestions,
    filter,
    sort,
  ]);

  if (
    !combobox ||
    !selectionDefined ||
    focusedEditorId !== editorId ||
    activeId !== id ||
    disabled
  ) {
    return null;
  }

  return <ComboboxContent combobox={combobox} {...props} />;
}

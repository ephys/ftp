import React from 'react';
import { onEvent } from '../utils/event-utils';

const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;

export const ContextMenuItem = MenuItem;

type Props = {
  children: React.ReactNode,
}

export type MenuBuilder = (e: Event) => Array<typeof MenuItem> | null;

export type AddMenuBuilder = (mb: MenuBuilder) => (() => void);

const ContextMenuContext = React.createContext<AddMenuBuilder | null>(null);

export function ContextMenuProvider(props: Props) {
  const [menuBuilders, setMenuBuilders] = React.useState<Set<MenuBuilder>>(new Set());

  React.useEffect(() => {
    return onEvent(window, 'contextmenu', e => {
      e.preventDefault();

      const menu = new Menu();

      for (const menuBuilder of menuBuilders.values()) {
        const menuItems = menuBuilder(e);

        if (!menuItems) {
          continue;
        }

        for (const menuItem of menuItems) {
          menu.append(menuItem);
        }
      }

      if (menu.items.length !== 0) {
        menu.popup({ window: remote.getCurrentWindow() });
      }
    }, false);
  }, [menuBuilders]);

  const addMenuBuilder: AddMenuBuilder = React.useCallback((mb: MenuBuilder) => {

    setMenuBuilders(oldMbs => {
      const newMbs = new Set(oldMbs);
      newMbs.add(mb);

      return newMbs;
    });

    return () => {
      setMenuBuilders(oldMbs => {
        const newMbs = new Set(oldMbs);
        newMbs.delete(mb);

        return newMbs;
      });
    };
  }, []);

  return (
    <ContextMenuContext.Provider value={addMenuBuilder}>
      {props.children}
    </ContextMenuContext.Provider>
  );
}

export function useContextMenu(callback: MenuBuilder, deps: any[]) {
  const addMenuBuilder: AddMenuBuilder | null = React.useContext(ContextMenuContext);

  if (addMenuBuilder == null) {
    console.warn('ContextMenuContext is null');
    return;
  }

  const memoizedCallback = React.useCallback(callback, deps);

  React.useEffect(() => {
    return addMenuBuilder(memoizedCallback);
  }, [memoizedCallback]);
}

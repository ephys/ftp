import React from 'react';
import 'focus-visible';
import './global.scss';
import { ContextMenuProvider } from '../context-menu';

type Props = {
  children: React.ReactNode,
};

export default function App(props: Props) {

  return (
    <ContextMenuProvider>
      {props.children}
    </ContextMenuProvider>
  );
}

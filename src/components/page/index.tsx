// @flow

import React from 'react';
import classes from 'classnames';
import css from './style.scss';

type Props = {
  children: React.ReactNode,
  className?: string,
};

export default function Page(props: Props) {
  return (
    <div className={classes(css.page, props.className)}>
      {props.children}
    </div>
  );
}

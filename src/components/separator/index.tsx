import React from 'react';
import css from './style.scss';

type Props = {
  children: React.ReactNode,
};

export default function Separator(props: Props) {
  const childCount = React.Children.count(props.children);

  if (childCount > 1) {
    throw new Error('Separator should have at most 1 child');
  }

  if (childCount === 0) {
    return <hr className={css.separatorSingle} />;
  }

  return <p className={css.separator}>{props.children}</p>;
}

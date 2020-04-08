import { SyntheticEvent } from 'react';

type FormElements = SyntheticEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

type ChangeResult<T> = { name: string, value: T };

export type GenericChangeEvent<T = any> = FormElements | ChangeResult<T>;

function isChangeResult<T>(val: any): val is ChangeResult<T> {
  // eslint-disable-next-line no-restricted-syntax
  return typeof val.name === 'string' && 'value' in val;
}

export function getChangeValue<T>(e: GenericChangeEvent<T>): ChangeResult<T> {
  if (isChangeResult(e)) {
    return e;
  }

  const target = e.currentTarget;
  const name = target.name;
  let value = target.value;

  if (target.nodeName === 'INPUT' && target.type === 'checkbox') {
    const allCheckboxes = target.form && target.name ? target.form.elements[target.name] : target;

    if (!Array.isArray(allCheckboxes)) {
      value = allCheckboxes.checked ? allCheckboxes.value : '';
    } else {
      value = [];
      for (const checkbox of allCheckboxes) {
        if (checkbox.checked) {
          value.push(checkbox.value);
        }
      }
    }
  }

  return {
    name,
    value,
  };
}

import { Select, type SelectProps } from 'antd';
import { useMemo } from 'react';

type Primitive = string | number | null;

type BaseProps<V extends Primitive> = Omit<SelectProps<V>, 'mode' | 'labelInValue' | 'allowClear' | 'value' | 'defaultValue' | 'onChange'> & {
  mode?: never;
  labelInValue?: never;
  allowClear?: never;

  value?: V;
  defaultValue?: V;
  onChange?: (value: V, option: unknown) => void;

  // 전체 옵션
  allOptionFlag?: boolean;
  allOptionLabel?: string;
  allOptionValue?: V;
};

function mergePopupRootClassName(props: any, extra?: string) {
  const dropdownClassName = props.dropdownClassName as string | undefined;
  return [props.classNames?.popup?.root, dropdownClassName, extra].filter(Boolean).join(' ');
}

export type SppSelectProps<V extends Primitive = any> = BaseProps<V>;

const SppSelect = <V extends Primitive = any>(props: SppSelectProps<V>) => {
  const popupRootClassName = mergePopupRootClassName(props);

  const { allOptionFlag = false, allOptionLabel = '전체', allOptionValue = '' as V, options, ...rest } = props;

  const mergedOptions = useMemo(() => {
    if (!allOptionFlag || !options?.length) return options;

    const hasAll = options.some((o: any) => o?.value === allOptionValue);
    if (hasAll) return options;

    return [{ label: allOptionLabel, value: allOptionValue }, ...options];
  }, [allOptionFlag, allOptionLabel, allOptionValue, options]);

  return (
    <Select<V>
      {...rest}
      options={mergedOptions}
      classNames={{
        ...props.classNames,
        popup: {
          ...props.classNames?.popup,
          root: popupRootClassName,
        },
      }}
    />
  );
};

export default SppSelect;

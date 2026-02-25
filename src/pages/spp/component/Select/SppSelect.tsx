import { Select, type SelectProps } from 'antd';

type Primitive = string | number | null;
type BaseProps<V extends Primitive> = Omit<SelectProps<V>, 'mode' | 'labelInValue' | 'value' | 'defaultValue' | 'onChange'> & {
  mode?: undefined;
  value?: V;
  defaultValue?: V;
  onChange?: (value: V, option: any) => void;
};

function mergePopupRootClassName(props: any, extra?: string) {
  const dropdownClassName = props.dropdownClassName as string | undefined;
  return [props.classNames?.popup?.root, dropdownClassName, extra].filter(Boolean).join(' ');
}

export type SppSelectProps<V extends Primitive = any> = BaseProps<V>;

const SppSelect = <V extends Primitive = any>(props: BaseProps<V>) => {
  const popupRootClassName = mergePopupRootClassName(props);

  const { ...rest } = props as any;

  return (
    <Select<V>
      {...rest}
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

import { Select, type SelectProps } from 'antd';

interface SppSelectProps extends SelectProps {}

const SppSelect = (props: SppSelectProps) => {
  const isMulti = props.mode === 'multiple' || props.mode === 'tags';

  const legacyDropdownClassName = (props as any).dropdownClassName as string | undefined;

  const popupRootClassName = [props.classNames?.popup?.root, legacyDropdownClassName, isMulti ? 'spp-select-multi-checkbox' : ''].filter(Boolean).join(' ');

  const { dropdownClassName, ...rest } = props as any;

  return (
    <Select
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

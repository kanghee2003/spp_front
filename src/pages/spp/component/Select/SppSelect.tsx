import { Select, type SelectProps } from 'antd';

interface SppSelectProps extends SelectProps {}

const SppSelect = (props: SppSelectProps) => {
  const isMulti = props.mode === 'multiple' || props.mode === 'tags';

  // dropdownClassName(deprecated) 사용중인 곳이 있어도 스타일은 유지되게 흡수
  // + Select에 dropdownClassName 자체는 전달하지 않아서 deprecate 경고 제거
  const legacyDropdownClassName = (props as any).dropdownClassName as string | undefined;

  const popupRootClassName = [props.classNames?.popup?.root, legacyDropdownClassName, isMulti ? 'spp-select-multi-checkbox' : ''].filter(Boolean).join(' ');

  // dropdownClassName은 제거하고 나머지만 전달
  const { dropdownClassName: _dropdownClassName, classNames, ...rest } = props as any;

  return (
    <>
      <Select
        {...rest}
        classNames={{
          ...classNames,
          popup: {
            ...classNames?.popup,
            root: popupRootClassName,
          },
        }}
      />
    </>
  );
};

export default SppSelect;

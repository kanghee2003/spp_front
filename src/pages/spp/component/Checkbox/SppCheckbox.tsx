import { Checkbox, CheckboxProps } from 'antd';

export interface SppCheckboxProps extends CheckboxProps {}

const SppCheckbox = (props: SppCheckboxProps) => {
  return <Checkbox {...props} />;
};

export default SppCheckbox;

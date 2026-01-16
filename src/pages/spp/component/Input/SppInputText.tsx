import { Input, InputProps } from 'antd';

export interface SppInputTextProps extends InputProps {}

const SppInputText = (props: SppInputTextProps) => {
  return <Input {...props} />;
};

export default SppInputText;

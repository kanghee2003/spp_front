import { Select, SelectProps } from 'antd';

interface SppSelectProps extends SelectProps {}

const SppSelect = (props: SppSelectProps) => {
  return (
    <>
      <Select {...props} />
    </>
  );
};

export default SppSelect;

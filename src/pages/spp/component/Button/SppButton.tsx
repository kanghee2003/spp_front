import { Button, ButtonProps } from 'antd';

interface SppButtonProps extends ButtonProps {}

const SppButton = (props: SppButtonProps) => {
  return <Button {...props} />;
};

export default SppButton;

import { Button, ButtonProps } from 'antd';

interface NisButtonProps extends ButtonProps {}

const NisButton = (props: NisButtonProps) => {
  return <Button {...props} />;
};

export default NisButton;

import { Button, ButtonProps } from 'antd';

interface EtcButtonProps extends ButtonProps {}

const EtcButton = (props: EtcButtonProps) => {
  return <Button {...props} />;
};

export default EtcButton;

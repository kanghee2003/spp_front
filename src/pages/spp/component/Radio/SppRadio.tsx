import { Radio, RadioProps } from 'antd';

export interface SppRadioProps extends RadioProps {
  options?: { value: any; label: string }[];
}

const SppRadio = ({ name, options, ...props }: SppRadioProps) => {
  return (
    <Radio.Group {...props}>
      {options &&
        options.map((item) => {
          return (
            <Radio key={item.value} value={item.value}>
              {item.label}
            </Radio>
          );
        })}
    </Radio.Group>
  );
};

export default SppRadio;

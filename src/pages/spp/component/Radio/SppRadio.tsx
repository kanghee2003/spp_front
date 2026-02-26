import { Radio } from 'antd';
import type { RadioGroupProps } from 'antd/es/radio';
import { ReactNode } from 'react';

export interface SppRadioProps extends RadioGroupProps {
  options?: { value: any; label: ReactNode }[];
}

const SppRadio = ({ options, ...props }: SppRadioProps) => {
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

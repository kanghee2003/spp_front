import { InputNumber, InputNumberProps } from 'antd';

export interface SppInputNumberProps extends InputNumberProps {}

const SppInputNumber = (props: SppInputNumberProps) => {
  const addComma = (v: string) => v.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <InputNumber
      {...props}
      controls={props.controls}
      formatter={(value) => {
        if (value === undefined || value === null) return '';
        const str = String(value);
        const [intPart, decPart] = str.split('.');
        return decPart !== undefined ? `${addComma(intPart)}.${decPart}` : addComma(intPart);
      }}
      parser={(value) => {
        if (!value) return '';
        return value.replace(/,/g, '');
      }}
    />
  );
};

export default SppInputNumber;

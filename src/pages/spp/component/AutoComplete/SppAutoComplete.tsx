import { AutoComplete, AutoCompleteProps } from 'antd';

export interface SppAutocompleteProps extends AutoCompleteProps {
  showName?: boolean;
  size?: 'small' | 'middle' | 'large';
  label?: string;
}

const SppAutoComplete = (props: SppAutocompleteProps) => {
  return (
    <>
      <AutoComplete {...props} size={props.size}>
        {props.children}
      </AutoComplete>
    </>
  );
};

export default SppAutoComplete;

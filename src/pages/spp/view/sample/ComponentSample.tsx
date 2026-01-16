import { Card, Col, DatePicker, Row, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import SppButton from '../../component/Button/SppButton';
import SppInputNumber from '../../component/Input/SppInputNumber';
import SppInputText from '../../component/Input/SppInputText';
import SppSelect from '../../component/Select/SppSelect';
import SppSelectForm from '../../component/Select/SppSelectForm';
import SamplePopup from './popup/SamplePopup';
import SppInputTextForm from '../../component/Input/SppInputTextForm';
import SppInputNumberForm from '../../component/Input/SppInputNumberForm';
import { useMessage } from '@/hook/useMessage';
import SppDatePickerForm from '../../component/DatePicker/SppDatePickerForm';
import SppAutoComplete from '../../component/AutoComplete/SppAutoComplete';
import { useMdiStore } from '@/store/mdi.store';
import { ComponentSampleOptions } from '../../type/ComponentSample.type';
import SppAutoCompleteForm from '../../component/AutoComplete/SppAutocompleteForm';

type ComponentSampleFomeType = {
  select: string;
  inputtext: string;
  inputnumber: string;
  datepicker: string;
  rangepicker: string;
  autocomplete: string;
};
const ComponentSample = () => {
  const openTab = useMdiStore((s) => s.openTab);
  const { alertMessage } = useMessage();
  const [optionList, setOptionList] = useState<ComponentSampleOptions[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const {
    control: sampleControl,
    setValue,
    getValues,
  } = useForm<ComponentSampleFomeType>({
    mode: 'onChange',
  });

  const handlePrintFormValue = () => {
    alertMessage(JSON.stringify(getValues()));
  };

  useEffect(() => {
    setOptionList([
      { value: 'A', label: 'A', seq: 1 },
      { value: 'B', label: 'B', seq: 1 },
      { value: 'C', label: 'C', seq: 1 },
    ]);
  }, []);

  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        컴포넌트
      </Typography.Title>
      <Card size="default" styles={{ body: { paddingTop: 12 } }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={3}>Input Text</Col>
          <Col span={6}>
            <SppInputText />
          </Col>
          <Col span={3}>Input Text Form</Col>
          <Col span={6}>
            <SppInputTextForm name="inputtext" control={sampleControl} />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={3}>Input Number</Col>
          <Col span={6}>
            <SppInputNumber controls={false} />
          </Col>
          <Col span={3}>Input Number Form</Col>
          <Col span={6}>
            <SppInputNumberForm name="inputnumber" controls={false} control={sampleControl} />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={3}>
            <Typography.Text>SELECT</Typography.Text>
          </Col>
          <Col span={6}>
            <SppSelect
              style={{ width: 120 }}
              placeholder="Select a person"
              options={[
                { value: 'jack', label: 'Jack' },
                { value: 'lucy', label: 'Lucy' },
                { value: 'Yiminghe', label: 'yiminghe' },
                { value: 'disabled', label: 'Disabled', disabled: true },
              ]}
            />
          </Col>
          <Col span={3}>
            <Typography.Text>Select Form</Typography.Text>
          </Col>
          <Col span={6}>
            <SppSelectForm
              name="select"
              style={{ width: 120 }}
              control={sampleControl}
              placeholder="Select a person"
              options={[
                { value: 'jack', label: 'Jack' },
                { value: 'lucy', label: 'Lucy' },
                { value: 'Yiminghe', label: 'yiminghe' },
                { value: 'disabled', label: 'Disabled', disabled: true },
              ]}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={3}>Datepicker</Col>
          <Col span={6}>
            <DatePicker />
          </Col>
          <Col span={3}>Datepicker Form</Col>
          <Col span={6}>
            <SppDatePickerForm name={'datepicker'} control={sampleControl} />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={3}>AutoComplete</Col>
          <Col span={6}>
            <SppAutoComplete
              style={{ width: '150px' }}
              options={optionList}
              onSelect={(value, item) => {
                console.log(value, item);
              }}
              showSearch={{
                filterOption: (input, option) =>
                  String(option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase()),
              }}
            />
          </Col>
          <Col span={3}>AutoComplete Form</Col>
          <Col span={6}>
            {' '}
            <SppAutoCompleteForm
              name="autocomplete"
              control={sampleControl}
              style={{ width: '150px' }}
              options={optionList}
              onSelect={(value, item) => {
                console.log(value, item);
              }}
              showSearch={{
                filterOption: (input, option) =>
                  String(option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase()),
              }}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <SppButton type="default" htmlType="button" onClick={handlePrintFormValue}>
              Form 값 출력
            </SppButton>
          </Col>
          <Col span={6}>
            <SppButton type="default" htmlType="button" onClick={() => setIsOpen(true)}>
              팝업호출
            </SppButton>
          </Col>
          <Col span={6}>
            <SppButton type="default" htmlType="button" onClick={() => openTab({ key: 'DASHBOARD', title: 'x' })}>
              대시보드로 이동
            </SppButton>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={3}></Col>
          <Col span={6}></Col>
          <Col span={3}></Col>
          <Col span={6}></Col>
        </Row>
      </Card>
      <SamplePopup open={isOpen} title={'Test Title'} style={{ minWidth: '800px' }} onOk={() => setIsOpen(false)} onCancel={() => setIsOpen(false)} />
    </Card>
  );
};

export default ComponentSample;

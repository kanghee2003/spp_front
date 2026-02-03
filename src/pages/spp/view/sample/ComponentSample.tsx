import { Card, Col, DatePicker, Row, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import SppButton from '../../component/Button/SppButton';
import SppInputNumber from '../../component/Input/SppInputNumber';
import SppInputText from '../../component/Input/SppInputText';
import SppSelect from '../../component/Select/SppSelect';
import SppSelectForm from '../../component/Select/SppSelectForm';
import SamplePopup from './popup/SamplePopup';
import ExcelUploadPopup from '../../component/Excel/ExcelUploadPopup';

import SppInputTextForm from '../../component/Input/SppInputTextForm';
import SppInputNumberForm from '../../component/Input/SppInputNumberForm';
import { useMessage } from '@/hook/useMessage';
import SppDatePickerForm from '../../component/DatePicker/SppDatePickerForm';
import SppAutoComplete from '../../component/AutoComplete/SppAutoComplete';
import { useMdiStore } from '@/store/mdi.store';
import { ComponentSampleOptions, ExcelUploadList, ExcelUploadRowScheme } from '../../type/ComponentSample.type';
import SppAutoCompleteForm from '../../component/AutoComplete/SppAutocompleteForm';
import { AutoCompleteMode } from '../../type/cm/AutoComplete.type';
import { downloadFile } from '@/utils/download.util';

import { isMatch } from '@/utils/regexp.util';
import { REGEXP_RULES } from '@/type/common.regexp';

type ComponentSampleFomeType = {
  select: string;
  multiselect: string;
  inputtext: string;
  inputnumber: string;
  datepicker: string;
  rangepicker: string;
  autocomplete: string;
};
const ComponentSample = () => {
  const openTab = useMdiStore((s) => s.openTab);
  const { alertMessage } = useMessage();
  const [regExpValue, setRegExpValue] = useState<string>('');
  const [optionList, setOptionList] = useState<ComponentSampleOptions[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [excelRows, setExcelRows] = useState<ExcelUploadList>([]);

  const handleExcelUploaded = (list: ExcelUploadList) => {
    setExcelRows(list);
    alertMessage(`엑셀 업로드 ${list.length}건 확인\n` + JSON.stringify(list.slice(0, 5), null, 2));
    setIsExcelOpen(false);
  };
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

  const handleExcelDownload = async () => {
    await downloadFile('/api/sample/excel/two-sheets', { filename: '매출_본부별.xlsx' });
  };

  const handleCheckRegExp = async () => {
    if (!isMatch(REGEXP_RULES.ALLOW_EMAIL, regExpValue)) {
      await alertMessage('입력 형식이 올바르지 않습니다.');
    } else {
      await alertMessage('검증 되었습니다.');
    }
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
          <Col span={3}>Input Text(정규식 영문만)</Col>
          <Col span={6}>
            <SppInputText validate={REGEXP_RULES.ALLOW_ENG} />
          </Col>
          <Col span={3}>Input Text(정규식 숫자만)</Col>
          <Col span={6}>
            <SppInputText
              validate={{ regExp: REGEXP_RULES.ALLOW_NUMBER.regExp, message: '숫자만 입력가능해요~~' }}
              onChange={(e) => console.log(e)}
              // onBlur={(e) => console.log(e)}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={3}>이메일</Col>
          <Col span={6}>
            <SppInputText value={regExpValue} />
          </Col>
          <Col span={6}>
            <SppButton type="default" htmlType="button" onClick={(e) => handleCheckRegExp()}>
              이메일 검증
            </SppButton>
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
          <Col span={3}>
            <Typography.Text>Multi Select</Typography.Text>
          </Col>
          <Col span={6}>
            <SppSelect
              mode="multiple"
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
            <Typography.Text>Multi Select Form</Typography.Text>
          </Col>
          <Col span={6}>
            <SppSelectForm
              mode="multiple"
              name="multiselect"
              defaultValue={['jack', 'lucy']}
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
          <Col span={5}>
            <SppButton type="default" htmlType="button" onClick={handlePrintFormValue}>
              Form 값 출력
            </SppButton>
          </Col>
          <Col span={5}>
            <SppButton type="default" htmlType="button" onClick={() => setIsOpen(true)}>
              팝업호출
            </SppButton>
          </Col>
          <Col span={5}>
            <SppButton type="default" htmlType="button" onClick={() => setIsExcelOpen(true)}>
              ExcelUpload
            </SppButton>
          </Col>
          <Col span={5}>
            <SppButton type="default" htmlType="button" onClick={handleExcelDownload}>
              ExcelDownload
            </SppButton>
          </Col>
          <Col span={4}>
            <SppButton type="default" htmlType="button" onClick={() => openTab({ key: 'DASHBOARD', title: 'x' })}>
              대시보드로 이동
            </SppButton>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={3}>자동완성 사용자</Col>
          <Col span={6}>
            <SppAutoComplete mode={AutoCompleteMode.USER} onSelect={(value, options) => console.log(value, options)} />
          </Col>
          <Col span={3}>자동완성 사용자 Form</Col>
          <Col span={6}>
            <SppAutoCompleteForm
              name="autocomplete"
              control={sampleControl}
              mode={AutoCompleteMode.USER}
              onSelect={(value, options) => console.log(value, options)}
            />
          </Col>
        </Row>
      </Card>
      <SamplePopup open={isOpen} title={'Test Title'} style={{ minWidth: '800px' }} onOk={() => setIsOpen(false)} onCancel={() => setIsOpen(false)} />
      <ExcelUploadPopup
        open={isExcelOpen}
        title={'Excel Upload Sample'}
        style={{ minWidth: '600px' }}
        rowScheme={ExcelUploadRowScheme}
        onUploaded={handleExcelUploaded}
        onOk={() => setIsExcelOpen(false)}
        onCancel={() => setIsExcelOpen(false)}
      />
    </Card>
  );
};

export default ComponentSample;

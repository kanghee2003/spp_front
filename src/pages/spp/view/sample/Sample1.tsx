import { useAlertFormErrors } from '@/hook/useFormErrors';
import SppButton from '@/pages/spp/component/Button/SppButton';
import SppCheckboxForm from '@/pages/spp/component/Checkbox/SppCheckboxForm';
import SppInputTextForm from '@/pages/spp/component/Input/SppInputTextForm';
import SppTable, { IUD_COLUMN } from '@/pages/spp/component/Table/SppTable';
import { Sample1Service } from '@/pages/spp/service/Sample1.service';
import { Sample1ListSearchReq, Sample1ListSearchScheme, Sample1Res, Sample1SaveReq, Sample1SaveScheme } from '@/pages/spp/type/Sample1.type';
import { SaveOutlined, SearchOutlined } from '@ant-design/icons';

import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Col, Row, Space, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import { Key, useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import SppDatePickerForm from '../../component/DatePicker/SppDatePickerForm';
import { IudType } from '../../../../type/common.type';

const Sample1 = () => {
  const alertFormErrors = useAlertFormErrors();
  const [search, setSeach] = useState<Sample1ListSearchReq | null>(null);
  const [pageParam, setPageParam] = useState<{ page: number; pageSize: number }>({ page: 1, pageSize: 10 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const tableRef = useRef<any>(null);

  const {
    control: searchFormControl,
    getValues: searchFormGetValues,
    handleSubmit: searchFormHandleSubmit,
    setError: searchFormSetError,
    clearErrors: searchFormClearErrors,
    formState: searchFormState,
  } = useForm<Sample1ListSearchReq>({
    resolver: zodResolver(Sample1ListSearchScheme),
    mode: 'onSubmit',
  });

  const {
    control: saveFormControl,
    getValues: saveFormGetValues,
    setValue: saveFormSetValue,
    handleSubmit: saveFormHandleSubmit,
    setError: saveFormSetError,
    clearErrors: saveFormClearErrors,
    formState: saveFormState,
    reset: saveFormReset,
  } = useForm<Sample1SaveReq>({
    resolver: zodResolver(Sample1SaveScheme),
    mode: 'onChange',
  });

  const {
    fields: saveFormFields,
    prepend: saveFormPrepend,
    append: saveFormAppend,
    update: saveFormUpdate,
    remove: saveFormRemove,
  } = useFieldArray({
    control: saveFormControl,
    name: 'list',
  });

  const { data: groupPage, refetch: refetchGroupData } = Sample1Service().getGroupListPage(search?.searchText ?? '', pageParam.page, pageParam.pageSize);
  const saveQuery = Sample1Service().save();

  /* ============================================== TEMPLATE ============================================== */
  const defaultSaveValue = {
    uuid: crypto.randomUUID(),
    cmGrpCd: '',
    cmGrpNm: '',
    useFlag: true,
    iudType: IudType.I,
  };

  const rowSelection: TableRowSelection<Sample1Res> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      console.log(newSelectedRowKeys);
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columns: ColumnsType<Sample1Res> = [
    IUD_COLUMN,
    {
      title: '분류코드',
      dataIndex: 'cmGrpCd',
      key: 'cmGrpCd',
      width: 100,
      align: 'center',
      render: (value, row) => {
        const index = findIndexById(row.uuid);
        return row.comGrpCdSeq || index < 0 ? (
          value
        ) : (
          <SppInputTextForm name={`list.${index}.cmGrpCd`} control={saveFormControl} onChange={() => handleSaveDatachanged(index)} />
        );
      },
    },
    {
      title: '분류명',
      dataIndex: 'cmGrpNm',
      key: 'cmGrpNm',
      width: 100,
      align: 'center',
      render: (value, row) => {
        const index = findIndexById(row.uuid);
        if (index < 0) return;
        return <SppInputTextForm name={`list.${index}.cmGrpNm`} control={saveFormControl} onChange={() => handleSaveDatachanged(index)} />;
      },
    },
    {
      title: '설명',
      dataIndex: 'cmGrpDesc',
      key: 'cmGrpDesc',
      width: 200,
      render: (value, row) => {
        const index = findIndexById(row.uuid);
        if (index < 0) return;
        return <SppInputTextForm name={`list.${index}.cmGrpDesc`} control={saveFormControl} onChange={() => handleSaveDatachanged(index)} />;
      },
    },
    {
      title: '사용여부',
      dataIndex: 'useFlag',
      key: 'useFlag',
      width: 75,
      align: 'center',
      render: (value, row) => {
        const index = findIndexById(row.uuid);
        if (index < 0) return;
        return <SppCheckboxForm name={`list.${index}.useFlag`} control={saveFormControl} onChange={() => handleSaveDatachanged(index)} />;
      },
    },
    {
      title: '사용시작일',
      dataIndex: 'strDate',
      key: 'strDate',
      width: 75,
      align: 'center',
      render: (value, row) => {
        const index = findIndexById(row.uuid);
        if (index < 0) return;
        return <SppDatePickerForm name={`list.${index}.strDate`} control={saveFormControl} onChange={() => handleSaveDatachanged(index)} />;
      },
    },
  ];

  /* ============================================== FUNCTION ============================================== */
  const findIndexById = (uuid: string) => saveFormFields.findIndex((f) => f.uuid === uuid);

  const handleSaveDatachanged = (index: number) => {
    const row = saveFormGetValues(`list.${index}`);
    saveFormUpdate(index, { ...row, iudType: IudType.U });
  };

  const handleSearch = (value: Sample1ListSearchReq) => {
    setSelectedRowKeys([]);
    tableRef.current?.resetPagination?.();
    setPageParam((prev) => ({ ...prev, page: 1 }));
    setSeach({ ...search, searchText: value.searchText });
  };

  const handleSave = () => {
    saveQuery.mutate(saveFormGetValues('list'), {
      onSuccess: () => {
        refetchGroupData();
      },
    });
  };

  const handlePrepend = () => {
    saveFormPrepend(defaultSaveValue);
  };

  const handleRemoveRow = () => {
    selectedRowKeys.reverse().map((v) => {
      const index = findIndexById(v as any);
      const row = saveFormGetValues(`list.${index}`);
      if (row.comGrpCdSeq) {
        saveFormUpdate(index, { ...row, iudType: IudType.D });
      } else {
        saveFormRemove(findIndexById(v as any));
      }
    });
  };

  /* ============================================== EFFECT ============================================== */
  useEffect(() => {
    if (!search) return;
    refetchGroupData();
  }, [search, pageParam.page, pageParam.pageSize]);

  useEffect(() => {
    if (!groupPage) {
      saveFormReset({ list: [] });
      return;
    }

    saveFormReset({
      list: groupPage.items,
    });
  }, [groupPage, saveFormReset]);

  useEffect(() => {
    const errors = searchFormState.errors;
    if (!errors || Object.keys(errors).length === 0) return;

    (async () => {
      await alertFormErrors(errors);
      searchFormClearErrors();
    })();
  }, [searchFormState.errors]);

  useEffect(() => {
    const errors = saveFormState.errors;
    if (!errors || Object.keys(errors).length === 0) return;

    (async () => {
      await alertFormErrors(errors);
      saveFormClearErrors();
    })();
  }, [saveFormState.errors]);

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      {/* ======= Title ======= */}
      <Card>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Sample1
        </Typography.Title>
      </Card>

      {/* ======= Search Area ======= */}
      <Card size="small" title="검색" styles={{ body: { paddingTop: 12 } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={16} md={12} lg={10} xl={8}>
            <Row gutter={8} align="middle">
              <Col flex="72px">
                <Typography.Text>검색어</Typography.Text>
              </Col>
              <Col flex="auto">
                <SppInputTextForm name="searchText" control={searchFormControl} placeholder="검색어를 입력해 주세요." />
              </Col>
            </Row>
          </Col>

          <Col xs={24} sm={8} md={12} lg={14} xl={16}>
            <Space wrap>
              <SppButton type="primary" htmlType="button" icon={<SearchOutlined />} onClick={(e) => searchFormHandleSubmit(handleSearch)(e)}>
                조회
              </SppButton>

              <SppButton type="default" htmlType="button" icon={<SaveOutlined />} onClick={(e) => saveFormHandleSubmit(handleSave)(e)}>
                저장
              </SppButton>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ======= Table Area ======= */}
      <Card
        size="small"
        title="목록"
        extra={
          <Space wrap>
            <SppButton type="default" htmlType="button" icon={<SaveOutlined />} onClick={handlePrepend}>
              행추가
            </SppButton>

            <SppButton type="default" htmlType="button" icon={<SaveOutlined />} onClick={handleRemoveRow} disabled={selectedRowKeys.length === 0}>
              행삭제
            </SppButton>
          </Space>
        }
        styles={{ body: { paddingTop: 8 } }}
      >
        <SppTable<Sample1Res>
          ref={tableRef}
          rowKey="uuid"
          rowNoFlag
          serverPaging
          columns={columns}
          dataSource={saveFormFields}
          pagination={{ total: groupPage?.totalCount ?? 0 }}
          rowSelection={rowSelection}
          rowSelectedFlag
          onChange={(pagination) => {
            // 페이지 변경 시 서버에서 해당 페이지 데이터를 다시 조회
            setSelectedRowKeys([]);
            setPageParam({
              page: pagination.current ? pagination.current : 1,
              pageSize: pagination.pageSize ? pagination.pageSize : 10,
            });
          }}
          onRow={(record, rowIndex) => ({
            onClick: () => {
              console.log('clicked record:', record);
              console.log('rowIndex:', rowIndex);
            },
          })}
        />
      </Card>
    </Space>
  );
};

export default Sample1;

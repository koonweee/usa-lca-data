
import { OptionType } from "@/components/lca-table-mobile/hooks/types";
import { FiltersConfig } from "@/components/lca-table-mobile/hooks/use-filters-bar";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Modal, DatePicker, Select, SelectProps, Space, Col, InputNumber, Row, Slider } from "antd";
import { useState } from "react";
const { RangePicker } = DatePicker;

interface Props {
  filterConfig?: FiltersConfig;
  onCancel: () => void;
}

export function FilterModal({filterConfig, onCancel}: Props) {
  return (
    <Modal title = "Filters" open={filterConfig !== undefined} onCancel={onCancel}>
      <Space direction = "vertical" size ='middle' style={{ display: 'flex' }}>
      <p>Select a {filterConfig?.displayName}</p>
      {
        filterConfig !== undefined ? getModalInputs(filterConfig.options, filterConfig.type) : null
      }
      </Space>
    </Modal>
  )
}

function getModalInputs(options: any[], inputsType: OptionType): JSX.Element | null {
  switch(inputsType) {
    case OptionType.CURRENCY_RANGE:
      return getCurrencyRangeInputs(options);
    case OptionType.DATE_RANGE:
      return getDateRangeInputs(options);
    case OptionType.MULTI_SELECT:
      return getMultiSelectInputs(options);
    default:
      return null;
  }
}

function getCurrencyRangeInputs(options: any[]): JSX.Element {
  const moneyOptions = options as number[];
  const min = moneyOptions[0];
  const max = moneyOptions[1];

  const [minValue, setMinValue] = useState<number | null>(1);
  const [maxValue, setMaxValue] = useState<number | null>(max);

  const minOnChange = (newValue: number | null) => {
    setMinValue(newValue);
    if (newValue !== null && maxValue !== null && newValue > maxValue) {
      setMaxValue(newValue);
    }
  };

  const maxOnChange = (newValue: number | null) => {
    setMaxValue(newValue);
    if (newValue !== null && minValue !== null && newValue < minValue) {
      setMinValue(newValue);
    }
  }

  const numberToMoneyFormatter = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return value;
    }
    return `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  return (
    <Space direction="vertical" size="middle" style={{display: 'flex',
    marginBottom: 24}}>
      <>
      <p>Minimum</p>
      <Row style={{display: 'flex'}} gutter={24} wrap>
        <Col xs={12} sm={16}>
          <Slider
            min={1}
            max={max}
            onChange={minOnChange}
            value={typeof minValue === 'number' ? minValue : 0}
            tooltip={{
              formatter: numberToMoneyFormatter
            }}
          />
        </Col>
        <Col xs={12} sm={8} style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <InputNumber
            min={1}
            max={max}
            value={minValue}
            onChange={minOnChange}
            formatter={(value) => numberToMoneyFormatter(value) as string}
            addonBefore="$"
          />
        </Col>
      </Row>
      </>
      <>
      <p>Maximum</p>
      <Row style={{display: 'flex'}} gutter={24} wrap>
      <Col xs={12} sm={16}>
        <Slider
          min={1}
          max={max}
          onChange={maxOnChange}
          value={typeof maxValue === 'number' ? maxValue : 0}
          tooltip={{
            formatter: numberToMoneyFormatter
          }}
        />
      </Col>
      <Col xs={12} sm={8} style={{
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <InputNumber
          min={1}
          max={max}
          value={maxValue}
          onChange={maxOnChange}
          formatter={(value) => numberToMoneyFormatter(value) as string}
          addonBefore="$"
        />
      </Col>
      </Row>
      </>
    </Space>
  );
}

function getDateRangeInputs(options: any[]): JSX.Element {
  const dateOptions = options as Date[];
  const min = dateOptions[0];
  const max = dateOptions[1];
  return (
    <Row gutter={0} align={'middle'}>
      <Col className="gutter-row" span={11} style={
        {
          justifyContent: 'center',
          display: 'flex'
        }
      }>
      <DatePicker picker="month" />
      </Col>
      <Col className="gutter-row" span={2} style={{
        justifyContent: 'center',
        display: 'flex'
      }}>
      <p>to</p>
      </Col>
      <Col className="gutter-row" span={11} style={
        {
          justifyContent: 'center',
          display: 'flex'
        }
      }>
      <DatePicker picker="month" />
      </Col>
    </Row>
)
}


function getMultiSelectInputs(options: any[]): JSX.Element {
  const strOptions = options as string[];
  const propOptions: SelectProps['options'] = [...strOptions.map((option) => ({label: option, value: option}))];
  return (
    <Select
      mode="multiple"
      allowClear
      style={{ width: '100%' }}
      placeholder="Please select"
      options={propOptions}
    />
  )
}

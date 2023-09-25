
import { OptionType } from "@/components/lca-table-mobile/hooks/types";
import { DateRangeInput, FiltersConfig, MultiSelectInput, NumberRangeInput } from "@/components/lca-table-mobile/hooks/use-filters-bar";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Modal, DatePicker, Select, SelectProps, Space, Col, InputNumber, Row, Slider } from "antd";
import { useState } from "react";
const { RangePicker } = DatePicker;

interface Props {
  filterConfig: FiltersConfig;
  onCancel: () => void;
}

export function FilterModal({filterConfig, onCancel}: Props) {
  const modalInputs = getModalInputHelper(filterConfig);
  const { inputComponent, onSubmit, clearFilter } = modalInputs!;
  const wrappedOnOk = () => {
    onSubmit();
    onCancel();
  }
  return (
    <Modal title = "Filters" open onCancel={onCancel} onOk={wrappedOnOk}>
      <Space direction = "vertical" size ='middle' style={{ display: 'flex' }}>
      <p>Select a {filterConfig?.displayName}</p>
      {inputComponent}
      </Space>
    </Modal>
  )
}



function getModalInputHelper(filterConfig: FiltersConfig) {
  const { type } = filterConfig;
  switch(type) {
    case OptionType.CURRENCY_RANGE:
      return getCurrencyRangeInputHelper(filterConfig);
    case OptionType.DATE_RANGE:
      return getDateRangeInputHelper(filterConfig);
    case OptionType.MULTI_SELECT:
      return getMultiSelectInputHelper(filterConfig);
    // default:
    //   return null;
  }
}

function getCurrencyRangeInputHelper(filterConfig: FiltersConfig) {
  const { options, setFilterInput, clearFilter, filterInput } = filterConfig;
  const castedFilterInput = filterInput as NumberRangeInput;
  const castedSetFilterInput = setFilterInput as (newFilterInput: NumberRangeInput | undefined) => void;
  const moneyOptions = options as number[];
  const min = moneyOptions[0];
  const max = moneyOptions[1];

  const [minValue, setMinValue] = useState(castedFilterInput?.min ?? min);
  const [maxValue, setMaxValue] = useState(castedFilterInput?.max ?? max);

  const minOnChange = (newValue: number | null) => {
    const newMinValue = newValue ?? 0
    setMinValue(newMinValue);
    if (!maxValue || newMinValue > maxValue) {
      setMaxValue(newMinValue);
    }
  };

  const maxOnChange = (newValue: number | null) => {
    const newMaxValue = newValue ?? 0
    setMaxValue(newMaxValue);
    if (!minValue || newMaxValue < minValue) {
      setMinValue(newMaxValue);
    }
  }

  const numberToMoneyFormatter = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return value;
    }
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const inputComponent = (
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
            value={minValue}
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
          value={maxValue}
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

  const onSubmit = () => {
    castedSetFilterInput((minValue !== min || maxValue !== max) ? {
      min: minValue,
      max: maxValue
    } : undefined);
  }
  return {
    inputComponent,
    onSubmit,
    clearFilter
  }
}

function getDateRangeInputHelper(filterConfig: FiltersConfig) {
  const { options, setFilterInput, clearFilter, filterInput } = filterConfig;
  const castedFilterInput = filterInput as DateRangeInput;
  const castedSetFilterInput = setFilterInput as (newFilterInput: DateRangeInput | undefined) => void;

  const [minDate, setMinDate] = useState(castedFilterInput?.min ?? null);
  const [maxDate, setMaxDate] = useState(castedFilterInput?.max ?? null);
  const component = (
    <Row gutter={0} align={'middle'}>
      <Col className="gutter-row" span={11} style={
        {
          justifyContent: 'center',
          display: 'flex'
        }
      }>
      <DatePicker value={minDate} picker="month" onChange={(date, dateString) => {
        setMinDate(date);
      }}/>
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
      <DatePicker value={maxDate} picker="month" onChange={(date, dateString) => {
        setMaxDate(date)
      }}/>
      </Col>
    </Row>
  )
  const onSubmit = () => {

    castedSetFilterInput((minDate || maxDate) ? {
      min: minDate ?? undefined,
      max: maxDate ?? undefined
    } : undefined);
  }
  return {
    inputComponent: component,
    onSubmit,
    clearFilter
  }
}

function multiSelectOptionsToPropOptions(options: string[]): SelectProps['options'] {
  return [...options.map((option) => ({label: option, value: option}))];
}

function getMultiSelectInputHelper(filterConfig: FiltersConfig) {
  const { options, setFilterInput, clearFilter, filterInput } = filterConfig;
  const strOptions = options as string[];
  const castedFilterInput = filterInput as MultiSelectInput;
  const castedSetFilterInput = setFilterInput as (newFilterInput: MultiSelectInput | undefined) => void;

  const [selectedOptions, setSelectedOptions] = useState(castedFilterInput?.selectedOptions ?? []);

  const component = (
    <Select
      mode="multiple"
      allowClear
      style={{ width: '100%' }}
      placeholder="Please select"
      value={selectedOptions}
      options={multiSelectOptionsToPropOptions(strOptions)}
      onChange={setSelectedOptions}
    />
  )

  const onSubmit = () => {
    castedSetFilterInput(selectedOptions.length > 0 ? {
      selectedOptions: selectedOptions
    } : undefined);
  }

  return {
    inputComponent: component,
    onSubmit,
    clearFilter
  }
}

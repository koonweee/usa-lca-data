import { Space, Tag } from "antd";
import { CloseCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { MouseEventHandler } from "react";

interface Props {
  isSelected: boolean;
  onClick: (isSelected: boolean) => any;
  onClear: () => any;
  displayName: string;
}

export function FilterChip(props: Props) {
  const { isSelected, onClick, displayName, onClear } = props;
  const onClose: MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation(); // prevent bubbling to parent onClick(s)
    onClear();
  }
  // note: manually specifying close icon bc antds props are broken
  return (
    <Tag
    onClick={() => onClick(!isSelected)}
    color = {isSelected ? "blue" : "default"}
    onClose={() => onClick(false)}
    >
      <Space size={[4,0]}>
        {displayName}
        {isSelected && <CloseOutlined onClick={onClose}/>}
      </Space>
    </Tag>
  )
}

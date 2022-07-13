import { ChangeEvent, FC, useCallback } from "react";
import { Button, FormControl } from "react-bootstrap";
import {
  MdKeyboardArrowUp as Up,
  MdKeyboardArrowDown as Down,
} from "react-icons/md";
import styled from "styled-components";

interface IntegerInputProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange(val: number): void;
  inputStyle?: CSSStyleRule;
}

const CustomInput = styled(FormControl)`
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  height: 60px;
`;

const ArrowButton = styled(Button)`
  margin: 0;
  height: 30px;
  display: flex;
  align-items: center;
`;

const UpArrowButton = styled(ArrowButton)`
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: 0;
`;

const DownArrowButton = styled(ArrowButton)`
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 0;
`;

const IntegerInput: FC<IntegerInputProps> = ({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  inputStyle = {},
}) => {
  const beforeChange = useCallback(
    (val: number) => {
      if (!val || val === NaN) {
        val = 0;
      }
      val = Math.min(Math.max(val, min), max);

      onChange(val);
    },
    [max, min, onChange]
  );

  return (
    <div className="d-flex">
      <CustomInput
        type="numeric"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          beforeChange(parseInt(e.target.value))
        }
        style={inputStyle}
      />
      <div>
        <UpArrowButton
          className="m-0"
          onClick={() => beforeChange(value + step)}
        >
          <Up className="m-0" />
        </UpArrowButton>
        <DownArrowButton
          className="m-0"
          onClick={() => beforeChange(value - step)}
        >
          <Down className="m-0" />
        </DownArrowButton>
      </div>
    </div>
  );
};

export default IntegerInput;

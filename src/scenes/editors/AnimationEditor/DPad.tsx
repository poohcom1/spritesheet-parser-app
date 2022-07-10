import { FC } from "react";
import { ButtonGroup, Button } from "react-bootstrap";
import {
  AiOutlineArrowUp,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineArrowDown,
} from "react-icons/ai";

interface DPadProps {
  onUp(): void;
  onLeft(): void;
  onRight(): void;
  onDown(): void;

  onUpLeft?: () => void;
  onDownLeft?: () => void;
  onUpRight?: () => void;
  onDownRight?: () => void;
}

const BUTTON_CLASSNAME = "m-0 w-25 d-flex justify-content-center";
const ICON_SIZE = 25;

const DPad: FC<DPadProps> = ({
  onUp,
  onLeft,
  onRight,
  onDown,
  onUpLeft,
  onDownLeft,
  onUpRight,
  onDownRight,
}) => (
  <ButtonGroup vertical>
    <ButtonGroup className="m-0">
      <Button className={BUTTON_CLASSNAME} onMouseDown={onUpLeft} />
      <Button className={BUTTON_CLASSNAME} onMouseDown={onUp}>
        <AiOutlineArrowUp size={ICON_SIZE} />
      </Button>
      <Button className={BUTTON_CLASSNAME} onMouseDown={onUpRight} />
    </ButtonGroup>
    <ButtonGroup className="m-0">
      <Button className={BUTTON_CLASSNAME} onMouseDown={onLeft}>
        <AiOutlineArrowLeft size={ICON_SIZE} />
      </Button>
      <Button className={BUTTON_CLASSNAME} disabled />
      <Button className={BUTTON_CLASSNAME} onMouseDown={onRight}>
        <AiOutlineArrowRight size={ICON_SIZE} />
      </Button>
    </ButtonGroup>
    <ButtonGroup className="m-0">
      <Button className={BUTTON_CLASSNAME} onMouseDown={onDownLeft} />
      <Button className={BUTTON_CLASSNAME} onMouseDown={onDown}>
        <AiOutlineArrowDown size={ICON_SIZE} />
      </Button>
      <Button className={BUTTON_CLASSNAME} onMouseDown={onDownRight} />
    </ButtonGroup>
  </ButtonGroup>
);

export default DPad;

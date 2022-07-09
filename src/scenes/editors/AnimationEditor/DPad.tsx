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
}

const BUTTON_CLASSNAME = "m-0 w-25 d-flex justify-content-center";
const ICON_SIZE = 25;

const DPad: FC<DPadProps> = ({ onUp, onLeft, onRight, onDown }) => (
  <ButtonGroup vertical>
    <ButtonGroup className="m-0">
      <Button className={BUTTON_CLASSNAME} />
      <Button className={BUTTON_CLASSNAME} onClick={onUp}>
        <AiOutlineArrowUp size={ICON_SIZE} />
      </Button>
      <Button className={BUTTON_CLASSNAME} />
    </ButtonGroup>
    <ButtonGroup className="m-0">
      <Button className={BUTTON_CLASSNAME} onClick={onLeft}>
        <AiOutlineArrowLeft size={ICON_SIZE} />
      </Button>
      <Button className={BUTTON_CLASSNAME} disabled />
      <Button className={BUTTON_CLASSNAME} onClick={onRight}>
        <AiOutlineArrowRight size={ICON_SIZE} />
      </Button>
    </ButtonGroup>
    <ButtonGroup className="m-0">
      <Button className={BUTTON_CLASSNAME} />
      <Button className={BUTTON_CLASSNAME} onClick={onDown}>
        <AiOutlineArrowDown size={ICON_SIZE} />
      </Button>
      <Button className={BUTTON_CLASSNAME} />
    </ButtonGroup>
  </ButtonGroup>
);

export default DPad;

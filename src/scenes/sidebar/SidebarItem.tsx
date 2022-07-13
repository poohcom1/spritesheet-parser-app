import { FC, useCallback, useState } from "react";
import { Collapse } from "react-bootstrap";
import styled from "styled-components";
import { BsFillFileSpreadsheetFill as SheetIcon } from "react-icons/bs";
import { MdOutlineAnimation as AnimIcon } from "react-icons/md";
import { MdArrowForwardIos as CollapseIcon } from "react-icons/md";
import useRootStore from "stores/rootStore";

const SheetItem = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  color: white;
  background-color: var(
    ${(props) => (props.selected ? "--bs-gray-dark" : "--bs-dark")}
  );
  padding: 16px;

  &:hover {
    background-color: var(--bs-gray-dark);
  }
`;

const ArrowIcon = styled(CollapseIcon)<{ collapsed: boolean }>`
  margin-left: auto;
  transform: rotate(${(props) => (props.collapsed ? "90deg" : "-90deg")});
  transition: transform 0.2s;

  border-radius: 5px;

  &:hover {
    background-color: var(--bs-gray-dark);
  }
`;

const AnimItem = styled(SheetItem)`
  padding-left: 32px;
`;

interface SidebarItemProps {
  sheetInd: number;
  sheet: Sheet;
}

const SidebarItem: FC<SidebarItemProps> = ({ sheet, sheetInd }) => {
  const selectSheet = useRootStore((s) => s.selectSheet);
  const selectAnim = useRootStore((s) => s.selectAnimation);

  const selectedSheet = useRootStore((s) => s.getSheet());
  const selectedAnimation = useRootStore((s) => s.getAnimation());

  const isSelectedAnim = useRootStore(
    useCallback(
      (s) => (anim: number) =>
        s.selectedSheet === sheetInd && s.selectedAnimation === anim,
      [sheetInd]
    )
  );

  const [open, setOpen] = useState(true);

  return (
    <>
      <SheetItem
        selected={selectedSheet === sheet && !selectedAnimation}
        onClick={() => selectSheet(sheetInd)}
      >
        <SheetIcon className="me-2" />
        {sheet.name}
        <ArrowIcon collapsed={open} onClick={() => setOpen(!open)}>
          <CollapseIcon className="m-2" />
        </ArrowIcon>
      </SheetItem>
      <Collapse in={open}>
        <div>
          {sheet.animations.map((anim, i) => (
            <AnimItem
              key={i}
              selected={isSelectedAnim(i)}
              onClick={() => selectAnim(sheetInd, i)}
            >
              <AnimIcon className="me-2" />
              {anim.name}
            </AnimItem>
          ))}
        </div>
      </Collapse>
    </>
  );
};

export default SidebarItem;

import { FC } from "react";
import { Button } from "react-bootstrap";
import AccordionBody from "react-bootstrap/esm/AccordionBody";
import AccordionHeader from "react-bootstrap/esm/AccordionHeader";
import AccordionItem from "react-bootstrap/esm/AccordionItem";
import { BsFillFileSpreadsheetFill as SheetIcon } from "react-icons/bs";
import { MdOutlineAnimation as AnimIcon } from "react-icons/md";
import styled from "styled-components";
import useRootStore from "stores/rootStore";

const ClearButton = styled.a`
  text-decoration: none;

  color: white;
  background-color: transparent;
  border: none;
  border-radius: 5px;

  margin: 0;
  padding: 8px;

  width: fit-content;
  height: 50px;

  display: flex;
  align-items: center;

  &:hover {
    background-color: #99999955;
  }

  &:active {
    background-color: #99999999;
  }
`;

const CustomAccordianHeader = styled(AccordionHeader)`
  background-color: black;
`;

interface SidebarItemProps {
  sheetInd: number;
  sheet: Sheet;
}

const SidebarItem: FC<SidebarItemProps> = ({ sheet, sheetInd }) => {
  const selectSheet = useRootStore((s) => s.selectSheet);
  const selectAnim = useRootStore((s) => s.selectAnimation);

  const selectedSheet = useRootStore((s) => s.selectedSheet);
  const selectedAnimation = useRootStore((s) => s.selectedAnimation);

  const isSelectedAnim = (anim: number) =>
    selectedSheet === sheetInd && anim === selectedAnimation;

  return (
    <AccordionItem className="p-0 bg-dark h-25" eventKey={`${sheetInd}`}>
      <CustomAccordianHeader bsPrefix="">
        <ClearButton
          style={{
            color: "var(--primary)",
            padding: "4px",
          }}
          onClick={(e) => {
            e.stopPropagation();
            selectSheet(sheetInd);
          }}
          className={`m-0 ${
            selectedSheet === sheetInd &&
            selectedAnimation === -1 &&
            "text-decoration-underline"
          }`}
        >
          <SheetIcon className="me-2" />
          {sheet.name}
        </ClearButton>
      </CustomAccordianHeader>
      <AccordionBody className="text-white bg-dark h-25 p-0">
        {sheet.animations.length ? (
          <>
            {sheet.animations.map((anim, i) => (
              <Button
                className={`btn-block w-100 m-0 ${isSelectedAnim(i)}`}
                onClick={() => selectAnim(sheetInd, i)}
                variant={isSelectedAnim(i) ? "light" : "dark"}
                key={anim.name}
              >
                <AnimIcon className="me-1" />
                {anim.name}
              </Button>
            ))}
          </>
        ) : (
          <p className="m-0 me-3 text-white-50 text-end">No animations yet</p>
        )}
      </AccordionBody>
    </AccordionItem>
  );
};

export default SidebarItem;

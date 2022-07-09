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

  padding: 8px;

  width: fit-content;

  &:hover {
    background-color: #99999955;
  }

  &:active {
    background-color: #99999999;
  }
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

  return (
    <AccordionItem className="p-0 bg-dark h-25" eventKey={`${sheetInd}`}>
      <AccordionHeader className="text-white bg-dark">
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
      </AccordionHeader>
      <AccordionBody className="text-white bg-dark h-25 p-0">
        {sheet.animations.length ? (
          <>
            {sheet.animations.map((anim, i) => (
              <Button
                className={`btn-block w-100 m-0 ${
                  selectedSheet === sheetInd &&
                  selectedAnimation === i &&
                  "text-decoration-underline"
                }`}
                onClick={() => selectAnim(sheetInd, i)}
                variant="dark"
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

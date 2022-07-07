import { FC, useContext } from "react";
import { Button } from "react-bootstrap";
import AccordionBody from "react-bootstrap/esm/AccordionBody";
import AccordionHeader from "react-bootstrap/esm/AccordionHeader";
import AccordionItem from "react-bootstrap/esm/AccordionItem";
import { BsFillFileSpreadsheetFill as SheetIcon } from "react-icons/bs";
import { MdOutlineAnimation as AnimIcon } from "react-icons/md";
import SheetContext from "../context/SheetContext";

interface SidebarItemProps {
  sheetInd: number;
  sheet: Sheet;
}
const SidebarItem: FC<SidebarItemProps> = ({ sheet, sheetInd }) => {
  const { setSelected, selectedSheet, selectedAnimation } =
    useContext(SheetContext);

  return (
    <AccordionItem className="p-0 bg-dark h-25" eventKey={`${sheetInd}`}>
      <AccordionHeader
        className="text-white bg-dark"
        onClick={() => setSelected(sheetInd, -1)}
      >
        <SheetIcon className="me-1" />
        <p
          className={`m-0 ${
            selectedSheet === sheetInd &&
            selectedAnimation === -1 &&
            "text-decoration-underline"
          }`}
        >
          {sheet.name}
        </p>
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
                onClick={() => setSelected(sheetInd, i)}
                variant="dark"
                key={anim.name}
              >
                <AnimIcon className="me-1" />
                {anim.name}
              </Button>
            ))}
          </>
        ) : (
          <p className="ms-3 mb-0 text-white-50">No animations yet</p>
        )}
      </AccordionBody>
    </AccordionItem>
  );
};

export default SidebarItem;

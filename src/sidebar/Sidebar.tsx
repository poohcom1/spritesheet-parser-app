import { FC } from "react";
import { Accordion } from "react-bootstrap";
import styled from "styled-components";
import SidebarItem from "./SidebarItem";

interface SidebarProps {
  sheets: Sheet[];
}

const SidebarContainer = styled.div`
  padding: 0px;
  padding-top: 5vh;
  height: 100%;
  width: 15vw;
`;

const Sidebar: FC<SidebarProps> = ({ sheets }) => {
  return (
    <SidebarContainer className="bg-dark">
      <Accordion className="border-0" defaultActiveKey={["0"]} alwaysOpen>
        <p className="text-white-50 m-2">Sprite-sheets</p>
        {sheets.map((sheet, i) => (
          <SidebarItem sheet={sheet} sheetInd={i} key={i} />
        ))}
      </Accordion>
    </SidebarContainer>
  );
};

export default Sidebar;

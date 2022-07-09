import { FC, ReactNode } from "react";
import styled from "styled-components";
import useDisplayStore from "../stores/displayStore";

interface EditorProps {
  screenElement: JSX.Element;
  panelElement: JSX.Element;
}

const EditorContainer = styled.div<{ height: number }>`
  height: ${(props) => props.height}vh;
  display: flex;
`;

const ScreenContainer = styled.div`
  margin: 16px;
  overflow: hidden;
  border: 1px solid black;
  width: 70%;
`;

const PanelContainer = styled.div`
  padding: 16px;
  height: 100%;
  color: white;
  flex-direction: column;
`;

export const PanelSectionHeader: FC<{ text: string }> = ({ text = "" }) => {
  return (
    <div className="d-flex">
      <hr className="me-2 w-100 flex-grow-1 text-white" />
      <p className="m-0 text-white-50 text-sm">{text}</p>
      <hr className="ms-2 w-100 flex-grow-1 text-white" />
    </div>
  );
};

export const PanelSection = ({
  header,
  children,
}: {
  header: string;
  children?: ReactNode;
}) => {
  return (
    <div>
      <PanelSectionHeader text={header} />
      <div className="p-1">{children}</div>
    </div>
  );
};

const Editor: FC<EditorProps> = ({ screenElement, panelElement }) => {
  const height = useDisplayStore((state) => state.height);

  return (
    <EditorContainer height={height}>
      <ScreenContainer>{screenElement}</ScreenContainer>
      <PanelContainer>{panelElement}</PanelContainer>
    </EditorContainer>
  );
};

export default Editor;

import { FC, ReactNode } from "react";
import styled from "styled-components";
import useEditorStore from "stores/editorStore";

interface EditorProps {
  screenElement: JSX.Element;
  panelElement: JSX.Element;
}

const EditorContainer = styled.div<{ height: number }>`
  height: ${(props) => props.height}vh;
  display: flex;
`;

const Screen = styled.div`
  margin: 16px;
  overflow: hidden;
  border: 1px solid black;
  width: 77%;
`;

const Panel = styled.div`
  padding: 16px;
  height: 100%;
  color: white;
  flex-direction: column;

  max-width: 300px;

  flex-grow: 1;
`;

export const PanelSectionHeader: FC<{ text: string }> = ({ text = "" }) => {
  return (
    <div className="d-flex align-items-center">
      <hr className="m-0 me-2 w-100 flex-grow-1 text-white" />
      <p className="m-0 text-white-50 text-sm text-nowrap">{text}</p>
      <hr className="m-0 ms-2 w-100 flex-grow-1 text-white" />
    </div>
  );
};

const _PanelContainer = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const PanelContainer: FC<{ title: string; children?: ReactNode }> = ({
  title,
  children,
}) => (
  <_PanelContainer>
    <h4>{title}</h4>
    {children}
  </_PanelContainer>
);

const _PanelSection = styled.div`
  width: 100%;

  * {
    margin-bottom: 4px;
  }
`;

export const PanelSection = ({
  header,
  children,
}: {
  header: string;
  children?: ReactNode;
}) => {
  return (
    <_PanelSection>
      <PanelSectionHeader text={header} />
      <div className="p-1">{children}</div>
    </_PanelSection>
  );
};

const Editor: FC<EditorProps> = ({ screenElement, panelElement }) => {
  const height = useEditorStore((state) => state.height);

  return (
    <EditorContainer height={height}>
      <Screen>{screenElement}</Screen>
      <Panel>{panelElement}</Panel>
    </EditorContainer>
  );
};

export default Editor;

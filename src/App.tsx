import React, { useCallback, useState } from "react";
import { getImageData, openFile } from "./lib/image";
import styled from "styled-components";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import SheetEditor from "./editors/SheetEditor/SheetEditor";
import Sidebar from "./sidebar/Sidebar";
import {
  AiOutlineZoomIn as ZoomInIcon,
  AiOutlineZoomOut as ZoomOutIcon,
} from "react-icons/ai";
import ClearButton from "./components/ClearButton/ClearButton";
import { blobDetection } from "./lib/blob-detection";
import AnimationEditor from "./editors/AnimationEditor/AnimationEditor";
import { useEffect } from "react";
import useDisplayStore from "./stores/displayStore";
import useRootStore from "./stores/rootStore";

const HEADER_SIZE = 5;
const TOOLBAR_SIZE = 7;
const EDITOR_SIZE = 100 - HEADER_SIZE - TOOLBAR_SIZE;

const AppContainer = styled.div`
  height: 100%;
  background-color: var(--bg-color);
`;

const MainContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const HeaderBar = styled(Navbar)`
  flex: 0 0 auto;
  width: 100vw;
  position: relative;
  height: ${HEADER_SIZE}vh;
`;

const ToolBar = styled.div`
  height: ${TOOLBAR_SIZE}vh;
  padding: 8px;
  display: flex;
`;

function App() {
  const sheets = useRootStore((s) => s.sheets);
  const addSheet = useRootStore((s) => s.addSheet);
  const currentSheet = useRootStore((s) => s.getSheet());
  const currentAnim = useRootStore((s) => s.getAnimation());

  const zoomIn = useDisplayStore((s) => s.zoomIn);
  const zoomOut = useDisplayStore((s) => s.zoomOut);
  const setHeight = useDisplayStore((s) => s.setHeight);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHeight(EDITOR_SIZE);
  }, [setHeight]);

  const loadFile = useCallback(async () => {
    const file = await openFile();

    if (!file) return;

    const image = await getImageData(file);
    const rects = blobDetection(image);

    addSheet({
      image,
      rects,
      name: file.name,
      animations: [],
    });
  }, [addSheet]);

  return (
    <AppContainer className="d-flex h-100">
      <Sidebar />
      <MainContainer>
        <HeaderBar variant="dark" bg="dark" expand="lg">
          <Container fluid>
            <Navbar.Toggle aria-controls="navbar-dark" />
            <Navbar.Collapse id="navbar-dark">
              <Nav>
                <NavDropdown
                  id="nav-dropdown-dark"
                  title="File"
                  menuVariant="dark"
                >
                  <NavDropdown.Item onClick={loadFile}>
                    Load image...
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item>Export</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </HeaderBar>
        <div className="d-flex flex-column">
          <ToolBar>
            <div className="d-flex">
              <div
                className="d-flex overflow-hidden  rounded align-items-center text-white-50 p-2"
                style={{ width: "150px", border: "1px solid grey" }}
              >
                {currentAnim?.name ?? currentSheet?.name ?? ""}
              </div>
              <ClearButton className="me-1" onClick={zoomIn}>
                <ZoomInIcon />
              </ClearButton>
              <ClearButton className="me-1" onClick={zoomOut}>
                <ZoomOutIcon />
              </ClearButton>
            </div>
          </ToolBar>

          {!currentAnim ? (
            <SheetEditor loading={loading} sheet={currentSheet} />
          ) : (
            <AnimationEditor
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              image={currentSheet!.image}
              animation={currentAnim}
            />
          )}
        </div>
      </MainContainer>
    </AppContainer>
  );
}

export default App;

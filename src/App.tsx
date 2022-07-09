import React, { useCallback, useState } from "react";
import { getImageData, openFile } from "./lib/image";
import styled from "styled-components";
import { Badge, Nav, Navbar, NavDropdown } from "react-bootstrap";
import SheetEditor from "./editors/SheetEditor/SheetEditor";
import Sidebar from "./sidebar/Sidebar";
import {
  AiOutlineZoomIn as ZoomInIcon,
  AiOutlineZoomOut as ZoomOutIcon,
} from "react-icons/ai";
import ClearButton from "./components/ClearButton/ClearButton";
import AnimationEditor from "./editors/AnimationEditor/AnimationEditor";
import { useEffect } from "react";
import useDisplayStore from "./stores/displayStore";
import useRootStore from "./stores/rootStore";
import { wrap } from "comlink";
import { Rect } from "blob-detection-ts";

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

const worker = new Worker(
  new URL("./workers/blob-detection-worker.ts", import.meta.url),
  {
    name: "blob-detection",
    type: "module",
  }
);

const { blobDetection } =
  wrap<import("./workers/blob-detection-worker").BlobDetectionWorker>(worker);

function App() {
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

    setLoading(true);
    const image = await getImageData(file);
    const rects = (await blobDetection(image)).map(
      (raw) =>
        new Rect(raw.left, raw.top, raw.right - raw.left, raw.bottom - raw.top)
    );

    addSheet({
      image,
      rects,
      name: file.name,
      animations: [],
    });
    setLoading(false);
  }, [addSheet]);

  return (
    <AppContainer className="d-flex h-100">
      <Sidebar />
      <MainContainer>
        <HeaderBar variant="dark" bg="dark" expand>
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
        </HeaderBar>
        <div className="d-flex flex-column">
          <ToolBar>
            <div className="d-flex">
              <div
                className="d-flex overflow-hidden rounded align-items-center text-white-50 p-2"
                style={{ width: "150px", border: "1px solid grey" }}
              >
                {currentAnim?.name ??
                  currentSheet?.name ??
                  (loading ? "Loading..." : "")}
              </div>
              <div
                className="d-flex ms-2 rounded justify-content-start align-items-center text-white-50 p-1"
                style={{ border: "1px solid grey" }}
              >
                <span>Move:</span>
                <Badge className="m-1" bg="secondary">
                  Ctrl + drag
                </Badge>
                <span>Zoom:</span>
                <Badge className="m-1" bg="secondary">
                  Scroll
                </Badge>
                <div
                  style={{
                    width: "4px",
                    height: "70%",
                    borderRight: "1px solid grey",
                    marginRight: "4px",
                  }}
                />
                <ClearButton className="me-1" onClick={zoomIn}>
                  <ZoomInIcon />
                </ClearButton>
                <ClearButton onClick={zoomOut}>
                  <ZoomOutIcon />
                </ClearButton>
              </div>
            </div>
          </ToolBar>

          {!currentAnim ? (
            <SheetEditor />
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

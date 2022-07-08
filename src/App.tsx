import React, { useCallback, useContext } from "react";
import { getImageData, openFile } from "./lib/image";
import styled from "styled-components";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import SheetEditor from "./editors/SheetEditor/SheetEditor";
import Sidebar from "./sidebar/Sidebar";
import { Rect } from "blob-detection-ts";
import { SpritesContext } from "./context/SpritesContext";
import {
  AiOutlineZoomIn as ZoomInIcon,
  AiOutlineZoomOut as ZoomOutIcon,
} from "react-icons/ai";
import ClearButton from "./components/ClearButton/ClearButton";
import { blobDetection } from "./lib/blob-detection";
import { EditorContext } from "./context/EditorContext";
import AnimationEditor from "./editors/AnimationEditor/AnimationEditor";

const HEADER_SIZE = 5;
const TOOLBAR_SIZE = 7;
export const EDITOR_SIZE = 100 - HEADER_SIZE - TOOLBAR_SIZE;

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
  const {
    value: sprites,
    dispatch: dispatchSprite,
    setValue: setSprites,
  } = useContext(SpritesContext);

  const { setValue: setEditorContext } = useContext(EditorContext);

  const loadFile = useCallback(async () => {
    const file = await openFile();

    if (!file) return;

    const imagesLen = sprites.sheets.length;

    const image = await getImageData(file);
    const rects = blobDetection(image);

    setSprites({
      sheets: [
        ...sprites.sheets,
        {
          image,
          rects,
          name: file.name,
          animations: [],
        },
      ],
      selectedSheet: imagesLen,
    });
  }, [setSprites, sprites.sheets]);

  const onAnimationCreated = useCallback(
    (rects: Rect[]) => {
      sprites.sheets[sprites.selectedSheet].animations.push({
        name:
          "Animation #" +
          (sprites.sheets[sprites.selectedSheet].animations.length + 1),
        rects,
      });

      dispatchSprite("sheets", [...sprites.sheets]);
    },
    [dispatchSprite, sprites.selectedSheet, sprites.sheets]
  );

  return (
    <AppContainer className="d-flex h-100">
      <Sidebar sheets={sprites.sheets} />
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
        <ToolBar>
          <div className="d-flex">
            <ClearButton
              className="me-1"
              onClick={() =>
                setEditorContext((s) => ({
                  zoom: s.zoom + 1,
                }))
              }
            >
              <ZoomInIcon />
            </ClearButton>
            <ClearButton
              className="me-1"
              onClick={() =>
                setEditorContext((s) => ({
                  zoom: s.zoom - 1,
                }))
              }
            >
              <ZoomOutIcon />
            </ClearButton>
          </div>
        </ToolBar>

        {sprites.selectedAnimation === -1 ? (
          <SheetEditor
            sheet={sprites.getSheet()}
            onAnimationCreated={onAnimationCreated}
          />
        ) : (
          <AnimationEditor
            image={sprites.getSheet().image}
            animation={sprites.getAnimation()}
          />
        )}
      </MainContainer>
    </AppContainer>
  );
}

export default App;

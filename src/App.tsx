import React, { useCallback, useMemo, useState } from "react";
import { getImageData, openFile } from "./lib/image";
import styled from "styled-components";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import SheetEditor from "./editors/SheetEditor/SheetEditor";
import Sidebar from "./sidebar/Sidebar";
import { Rect } from "blob-detection-ts";
import SheetContext, { SheetContextType } from "./context/SheetContext";
import EditorContext, { EditorContextType } from "./context/EditorContext";
import {
  AiOutlineZoomIn as ZoomInIcon,
  AiOutlineZoomOut as ZoomOutIcon,
} from "react-icons/ai";
import ClearButton from "./components/ClearButton/ClearButton";
import { blobDetection } from "./lib/blob-detection";

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
  const [images, setImages] = useState<Sheet[]>([]);
  const [selectedImage, setSelectedImage] = useState(-1);
  const [selectedAnimation, setSelectedAnimation] = useState(-1);

  const sheetContext = useMemo<SheetContextType>(
    () => ({
      sheets: images,
      selectedSheet: selectedImage,
      selectedAnimation,
      setSelected(sheetInd, animInd) {
        setSelectedImage(sheetInd);
        setSelectedAnimation(animInd);
      },
    }),
    [images, selectedAnimation, selectedImage]
  );

  const [editorContext, setEditorContext] = useState<EditorContextType>({
    zoom: 1.0,
    height: EDITOR_SIZE,
  });

  const loadFile = useCallback(async () => {
    const file = await openFile();

    if (!file) return;

    const imagesLen = images.length;

    const image = await getImageData(file);
    const rects = blobDetection(image);

    setImages([
      ...images,
      {
        image,
        rects,
        name: file.name,
        animations: [],
      },
    ]);
    setSelectedImage(imagesLen);
  }, [images]);

  const onAnimationCreated = useCallback(
    (rects: Rect[]) => {
      images[selectedImage].animations.push({
        name: "Animation #" + (images[selectedImage].animations.length + 1),
        rects,
      });

      setImages([...images]);
    },
    [images, selectedImage]
  );

  return (
    <AppContainer className="d-flex h-100">
      <SheetContext.Provider value={sheetContext}>
        <EditorContext.Provider
          value={{
            editorContext,
            setEditorContext,
          }}
        >
          <Sidebar sheets={images} />
          <MainContainer>
            <HeaderBar variant="dark" bg="dark" expand="lg">
              <Container fluid>
                <Navbar.Toggle aria-controls="navbar-dark-example" />
                <Navbar.Collapse id="navbar-dark-example">
                  <Nav>
                    <NavDropdown
                      id="nav-dropdown-dark-example"
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
                    setEditorContext({
                      ...editorContext,
                      zoom: editorContext.zoom + 0.5,
                    })
                  }
                >
                  <ZoomInIcon />
                </ClearButton>
                <ClearButton
                  className="me-1"
                  onClick={() =>
                    setEditorContext({
                      ...editorContext,
                      zoom: editorContext.zoom - 0.5,
                    })
                  }
                >
                  <ZoomOutIcon />
                </ClearButton>
              </div>
            </ToolBar>

            <SheetEditor
              sheet={images[selectedImage]}
              onAnimationCreated={onAnimationCreated}
            />
          </MainContainer>
        </EditorContext.Provider>
      </SheetContext.Provider>
    </AppContainer>
  );
}

export default App;

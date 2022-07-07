import React, { useCallback, useState } from "react";
import { getImageData, openFile } from "./lib/image";
import styled from "styled-components";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import SheetEditor from "./editors/SheetEditor/SheetEditor";
import Sidebar from "./sidebar/Sidebar";
import { Rect } from "blob-detection-ts";
import SheetContext from "./context/SheetContext";

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
  height: 5vh;
`;

const ToolBar = styled.div`
  height: 5vh;
  padding: 8px;
  display: flex;
`;

function App() {
  const [images, setImages] = useState<Sheet[]>([]);
  const [selectedImage, setSelectedImage] = useState(-1);
  const [selectedAnimation, setSelectedAnimation] = useState(-1);

  const loadFile = useCallback(async () => {
    const file = await openFile();

    if (!file) return;

    const imagesLen = images.length;

    setImages([
      ...images,
      {
        image: await getImageData(file),
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
      <SheetContext.Provider
        value={{
          sheets: images,
          selectedSheet: selectedImage,
          selectedAnimation,
          setSelected(sheetInd, animInd) {
            setSelectedImage(sheetInd);
            setSelectedAnimation(animInd);
          },
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
            <div className="d-flex"></div>
          </ToolBar>

          <SheetEditor
            image={images[selectedImage]?.image}
            onAnimationCreated={onAnimationCreated}
          />
        </MainContainer>
      </SheetContext.Provider>
    </AppContainer>
  );
}

export default App;

import React, { useCallback, useMemo, useState, useTransition } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import SelectionCanvas from "./components/SelectionCanvas/SelectionCanvas";
import { getBinaryImage, getImageData, openFile } from "./lib/image";
import MSER, { MSEROptions } from "blob-detection-ts";
import styled from "styled-components";
import {
  Button,
  Container,
  Form,
  Nav,
  Navbar,
  NavDropdown,
} from "react-bootstrap";

const AppContainer = styled.div`
  height: 100%;
  background-color: var(--bg-color);
`;

const MainContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const SideBar = styled(Navbar)`
  padding: 16px;
  padding-top: 70px;
  height: 100%;
  color: white;
  flex-direction: column;
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

const CanvasContainer = styled.div`
  margin: 16px;
  height: 85vh;
  border: 1px solid black;
  width: fit-content;
  overflow-y: auto;
`;

const DEFAULT_OPTIONS = {
  delta: 0,
  minArea: 0,
  maxArea: 0.5,
  maxVariation: 0.5,
  minDiversity: 0.33,
};

function App() {
  const [originalImageData, setOriginalImageData] = useState<
    ImageData | undefined
  >(undefined);

  // toolbar type

  // image tools
  const [MSEROptions, setMSEROptions] = useState<MSEROptions>(DEFAULT_OPTIONS);

  const setOption = useCallback(
    (key: keyof MSEROptions, value: string) => {
      setMSEROptions({ ...MSEROptions, [key]: parseFloat(value) });
    },
    [MSEROptions]
  );

  // selection tools

  // animation tools

  const loadFile = useCallback(async () => {
    const file = await openFile();

    if (!file) return;

    setOriginalImageData(await getImageData(file));
  }, []);

  const [rects, imageData] = useMemo(() => {
    if (!originalImageData) return [[], undefined];

    const imgData = new ImageData(
      new Uint8ClampedArray(originalImageData.data),
      originalImageData.width,
      originalImageData.height
    );
    const binaryImgData = getBinaryImage(imgData);
    const mser = new MSER(MSEROptions);

    let rects = mser.extract(binaryImgData).map((r) => r.rect);

    rects = mser.mergeRects(rects);

    rects.forEach((rect) => {
      mser.drawRectOutline(rect, [255, 0, 0, 255], imgData);
    });

    return [rects, imgData];
  }, [MSEROptions, originalImageData]);

  return (
    <AppContainer className="d-flex h-100">
      <SideBar variant="dark" bg="dark" expand="lg">
        <Container fluid>
          <h3>Animations</h3>
        </Container>
      </SideBar>
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
        <div className="d-flex">
          <CanvasContainer>
            {imageData && <SelectionCanvas image={imageData} rects={rects} />}
          </CanvasContainer>
          <div className="w-25">
            <Form.Label className="text-white">
              Delta: {MSEROptions.delta}
            </Form.Label>
            <Form.Range
              min={0}
              max={10}
              step={1}
              value={MSEROptions.delta}
              onChange={(e) => setOption("delta", e.target.value)}
            />
            <Form.Label className="text-white">
              Min-Area: {MSEROptions.minArea}
            </Form.Label>
            <Form.Range
              min={0}
              max={1}
              step={0.001}
              value={MSEROptions.minArea}
              onChange={(e) => setOption("minArea", e.target.value)}
            />
            <Form.Label className="text-white">
              Max-Area: {MSEROptions.maxArea}
            </Form.Label>
            <Form.Range
              min={0}
              max={1}
              step={0.001}
              value={MSEROptions.maxArea}
              onChange={(e) => setOption("maxArea", e.target.value)}
            />
            <Form.Label className="text-white">
              Min-Diversity: {MSEROptions.minDiversity}
            </Form.Label>
            <Form.Range
              min={0}
              max={1}
              step={0.001}
              value={MSEROptions.minDiversity}
              onChange={(e) => setOption("minDiversity", e.target.value)}
            />
            <Form.Label className="text-white">
              Max-Variation: {MSEROptions.maxVariation}
            </Form.Label>
            <Form.Range
              min={0}
              max={1}
              step={0.001}
              value={MSEROptions.maxVariation}
              onChange={(e) => setOption("maxVariation", e.target.value)}
            />
          </div>
        </div>
      </MainContainer>
    </AppContainer>
  );
}

export default App;

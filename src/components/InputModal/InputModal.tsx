import { FC, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import create from "zustand";
import { combine } from "zustand/middleware";

// Store

const inputModalState = {
  show: false,
};

const inputModalStore = create(
  combine(inputModalState, (set) => ({
    setShow: (show: boolean) => set({ show }),
  }))
);

export const useInputModal = (): [boolean, (show: boolean) => void] => [
  inputModalStore((s) => s.show),
  inputModalStore((s) => s.setShow),
];

// Component

const ScreenOverlay = styled.div`
  background-color: #0000009d;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
`;

const InputContainer = styled.div`
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 480px;
  height: 64px;

  padding: 16px;
  border-radius: 16px;
  background-color: var(--bg-color);

  display: flex;
  color: white;
`;

const Input = styled.input`
  width: 100%;
  height: 100%;
`;

interface InputModalProps {
  label?: string;
  onSubmit?: (input: string) => void;
}

const InputModal: FC<InputModalProps> = ({
  label = "URL",
  onSubmit = () => null,
}) => {
  const [show, setShow] = useInputModal();

  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState("");

  useEffect(() => {
    if (navigator.clipboard.readText)
      navigator.clipboard.readText().then((text) => setFile(text));

    const escListener = (e: KeyboardEvent) =>
      e.key === "Escape" && setShow(false);

    window.addEventListener("keyup", escListener);

    return () => window.removeEventListener("keyup", escListener);
  }, [setShow]);

  useEffect(() => {
    if (show) {
      setFile("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [show]);

  return (
    <>
      {show && (
        <ScreenOverlay
          onClick={(e) => e.target === e.currentTarget && setShow(false)}
        >
          <InputContainer>
            <label htmlFor="modalInput" style={{ marginRight: "16px" }}>
              {label}:
            </label>
            <Input
              ref={inputRef}
              id="modalInput"
              type="text"
              onInput={(e) => setFile(e.currentTarget.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  setShow(false);
                  onSubmit(e.currentTarget.value);
                }
              }}
              value={file}
            />
          </InputContainer>
        </ScreenOverlay>
      )}
    </>
  );
};

export default InputModal;

import styled from "styled-components";

const ClearButton = styled.button`
  color: white;
  background-color: transparent;
  border: none;
  border-radius: 5px;

  padding: 8px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: fit-content;
  height: fit-content;

  &:hover {
    background-color: #99999955;
  }

  &:active {
    background-color: #99999999;
  }
`;

export default ClearButton;

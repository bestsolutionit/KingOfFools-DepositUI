import styled from "styled-components";

export const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

export const Result = styled.div`
  font-size: 16px;
  margin-bottom: 10px;
`;
export const ReferenceLink = styled.a`
  color: blue;
  text-decoration: underline;
  margin-bottom: 100px;
`;
export const Warning = styled.div`
  color: red;
`;
export const Balance = styled.div`
  color: green;
`;
export const InputLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
  min-height: 30px;
`;
export const Label = styled.div`
  font-size: 18px;
  white-space: nowrap;
`;
export const DepositAmount = styled.input`
  width: 200px;
  height: 40px;
  font-size: 18px;
  padding: 0 8px;
  text-align: right;
`;
export const SelectCrypto = styled.select`
  width: 220px;
  height: 40px;
  font-size: 18px;
  padding: 0 8px;
  text-align: right;
`;
export const ModalContent = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 250px;
  padding: 0 60px;
  margin: 40px 0;
`;
export const Container = styled.div`
  flex: 1;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const Button = styled.div`
  width: 200px;
  height: 40px;
  background-color: black;
  border-radius: 5px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  margin: 10px 10px;
`;

import { useEffect, useState } from "react";
import Modal from "react-modal";
import usdcAbi from "./abis/USDC.json";
import depositAbi from "./abis/Deposit.json";
import { useMoralis } from "react-moralis";
import { CONTRACT_ADDRESS, USDC_ADDRESS, ALLOW_LIIMIT } from './config'
import {
  Container,
  Result,
  ReferenceLink,
  Button,
  ModalContent,
  InputLine,
  Label,
  SelectCrypto,
  Balance,
  DepositAmount,
  Warning,
  customStyles,
} from "./styles";

function App() {
  const { authenticate, isAuthenticated, user, logout, Moralis, account } =
    useMoralis();
  const [showModal, setShowModal] = useState(false);
  const [inputAmount, setInputAmount] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [warning, setWarning] = useState(false);
  const [selectedMode, setSelectedMode] = useState("ETH");
  const [resultLink, setResultLink] = useState("");
  const [hadDeposit, setHadDeposit] = useState(false);
  const onHandleChangeAmount = (e: { target: { value: any } }) => {
    setInputAmount(Number(e.target.value));
  };
  useEffect(() => {
    if (selectedMode === "ETH") {
      if (inputAmount >= ethBalance) {
        setWarning(true);
      } else {
        setWarning(false);
      }
    }
    if (selectedMode === "USDC") {
      if (inputAmount >= usdcBalance) {
        setWarning(true);
      } else {
        setWarning(false);
      }
    }
  }, [ethBalance, inputAmount, selectedMode, usdcBalance]);

  const currentUser = user?.attributes;
  const init = async () => {
    if (currentUser) {
      setSelectedMode("ETH");
      const nativeBalance = await Moralis.Web3API.account.getNativeBalance({
        chain: "goerli",
        address: user?.attributes.ethAddress,
      });
      setEthBalance(Number(nativeBalance?.balance) / 1000000000000000000);
      const tokenBalances = await Moralis.Web3API.account.getTokenBalances({
        chain: "goerli",
        address: user?.attributes.ethAddress,
      });
      tokenBalances.forEach((tokenBalance) => {
        if (tokenBalance.symbol === "USDC") {
          const usdcAmount = tokenBalance.balance;
          setUsdcBalance(Number(usdcAmount) / 1000000);
        }
      });
      await Moralis.enableWeb3();
    }
  };
  useEffect(() => {
    init();
  }, [account, isAuthenticated]);

  const handleChangeCrypto = (e: any) => {
    setSelectedMode(e.target.value);
  };
  const onDeposit = async () => {
    setWarning(false);
    setInputAmount(0);
    if (selectedMode === "USDC") {
      const isApproved = await checkAllowance();
      if (!isApproved) {
        await approvePayment();
      }
      deposit("USDC");
    } else {
      deposit("ETH");
    }
  };
  const approvePayment = async () => {
    const approve_request = {
      chain: "goerli",
      contractAddress: USDC_ADDRESS,
      functionName: "approve",
      abi: usdcAbi,
      params: {
        _spender: CONTRACT_ADDRESS,
        _value: ALLOW_LIIMIT,
      },
    };
    console.log("approve_request", approve_request);
    Moralis.executeFunction(approve_request);
  };

  const checkAllowance = async () => {
    let res = false;
    const allowance_request = {
      chain: "goerli",
      contractAddress: USDC_ADDRESS,
      functionName: "allowance",
      abi: usdcAbi,
      params: {
        _spender: CONTRACT_ADDRESS,
        _owner: account,
      },
    };
    console.log("allowance_request", allowance_request);
    const result = (await Moralis.executeFunction(allowance_request)) as any;
    if (Number(result._hex) >= ALLOW_LIIMIT) {
      res = true;
    }
    return res;
  };

  const deposit = async (type: string) => {
    const finalParams = {
      _amount: inputAmount * Math.pow(10, selectedMode === "ETH" ? 18 : 6),
    };
    let options = {
      contractAddress: CONTRACT_ADDRESS,
      functionName: type === "ETH" ? "depositEth" : "depositUSDC",
      abi: depositAbi,
      params: finalParams,
    };
    console.log("deposit request:", options)
    try {
      const message = await Moralis.executeFunction(options);
      setHadDeposit(true);
      setResultLink(message.hash);
      init();
      setShowModal(false);
    } catch (error) {
      console.log("Failture:", error);
      init();
      setShowModal(false);
    }
    
  };

  return (
    <div className="App">
      <Container>
        {resultLink.length > 0 && (
          <>
            <Result>
              Deposit suceess! You can check the transaction by clicking the
              link below.
            </Result>
            <ReferenceLink
              target="_blank"
              href={`https://goerli.etherscan.io/tx/${resultLink}`}
            >
              {resultLink}
            </ReferenceLink>
          </>
        )}
        <Button
          onClick={() => {
            if (isAuthenticated) {
              setResultLink("")
              logout();
            } else {
              authenticate();
            }
          }}
        >
          {isAuthenticated ? "DISCONNECT" : "CONNECT"}
        </Button>
        {isAuthenticated &&
          <Button
            onClick={() => {
              setShowModal(true);
              setResultLink("");
            }}
          >
            DEPOSIT {hadDeposit ? "MORE" : ""}
          </Button>
        }
      </Container>
      <Modal
        style={customStyles}
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <ModalContent>
          <InputLine>
            <Label>Currency</Label>
            <SelectCrypto id="crypto" onChange={handleChangeCrypto}>
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
            </SelectCrypto>
          </InputLine>
          <InputLine>
            <Label />
            <Balance>
              Balance: {selectedMode === "ETH" ? ethBalance : usdcBalance}
            </Balance>
          </InputLine>
          <InputLine>
            <Label>Input Amount</Label>
            <DepositAmount type="number" onChange={onHandleChangeAmount} />
          </InputLine>
          <InputLine>
            <Label />
            {warning && <Warning>Input exceeded balance</Warning>}
          </InputLine>
          <InputLine>
            <Button onClick={onDeposit}>DEPOSIT</Button>
            <Button
              onClick={() => {
                setShowModal(false);
              }}
            >
              CANCEL
            </Button>
          </InputLine>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default App;

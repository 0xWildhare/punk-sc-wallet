import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Button, Input, Select, InputNumber, Space, Tooltip } from "antd";
import { CodeOutlined } from '@ant-design/icons';
import { AddressInput, EtherInput, WalletConnectInput } from "../";
import TransactionDetailsModal from "./TransactionDetailsModal";
import { parseExternalContractTransaction } from "../../helpers";
import { useLocalStorage } from "../../hooks";
import { ethers } from "ethers";
import { parseEther } from "@ethersproject/units";
import ERC20 from "../../contracts/ERC20.json";
const { Option } = Select;

const iface = new ethers.utils.Interface(ERC20.abi);
const axios = require("axios");

export default function CreateTransaction({
  poolServerUrl,
  contractName,
  contractAddress,
  mainnetProvider,
  localProvider,
  price,
  readContracts,
  userSigner,
  nonce,
  signaturesRequired,
  tx,
  writeContracts,
}) {
  const history = useHistory();

  const [methodName1, setMethodName1] = useLocalStorage("methodName1", "transferFunds");
  const [methodName2, setMethodName2] = useLocalStorage("methodName2", "Transfer");
  const [newSignaturesRequired, setNewSignaturesRequired] = useState(signaturesRequired)
  const [amount, setAmount] = useState("0");
  const [to, setTo] = useLocalStorage("to");
  const [customCallData, setCustomCallData] = useState("");
  const [parsedCustomCallData, setParsedCustomCallData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWalletConnectTransaction, setIsWalletConnectTransaction] = useState(false);

  const [hasEdited, setHasEdited] = useState() //we want the signaturesRequired to update from the contract _until_ they edit it

  useEffect(()=>{
    if(!hasEdited){
      setNewSignaturesRequired(signaturesRequired)
    }
  },[signaturesRequired])

  const showModal = () => {
    setIsModalVisible(true);
  };

  const inputStyle = {
    padding: 10,
  };

  useEffect(() => {
    const getParsedTransaction = async () => {
      const parsedTransaction = await parseExternalContractTransaction(to, customCallData);
      setParsedCustomCallData(parsedTransaction);
    }

    getParsedTransaction();
  }, [customCallData]);

  const loadWalletConnectData = ({ to, value, data }) => {
    setTo(to);
    value ? setAmount(ethers.utils.formatEther(value)) : setAmount("0");
    setCustomCallData(data);
    setIsWalletConnectTransaction(true);
  };

  const [customTokenAddress, setCustomTokenAddress] = useState();
  const [custTokenSymbol, setCustTokenSymbol] = useState();
  const [custTokenName, setCustTokenName] = useState();
  const [custTokenBalance, setCustTokenBalance] = useState();
  const [tokDecimals, setTokDecimals] = useState();
  const [transferToAddress, setTransferToAddress] = useState();
  const [transferAmount, setTransferAmount] = useState();
  const [formattedTransferAmount, setFormattedTransferAmount] = useState();
  const [tokenMenuVisibility, setTokenMenuVisibility] = useState(false);

  const handleTransferTo = async (e) => {
    let enteredTo = e.target.value;
    if (ethers.utils.isAddress(enteredTo)) {
      setTransferToAddress(enteredTo)
    } else setTransferToAddress('');
  }

  const handleTransferAmount = async (e) => {
    let enteredAmount = e.target.value;
    setTransferAmount(enteredAmount)
    let enteredAmountFormatted = ethers.utils.parseUnits(enteredAmount, tokDecimals);
    setFormattedTransferAmount(enteredAmountFormatted);
  }

  const handleAddressChange = async (enteredAddress) => {
    setTo(enteredAddress);
    if(methodName1 == "erc20Transaction") {

      if (ethers.utils.isAddress(enteredAddress)) {
        const customContract = new ethers.Contract(enteredAddress, ERC20.abi, localProvider);
          setCustomTokenAddress(enteredAddress)
        const newCustTokenSymbol = await customContract.functions.symbol();
        const newCustTokenName = await customContract.functions.name();
        const newCustTokenBalance = await customContract.functions.balanceOf(contractAddress);
        const newTokDecimals = await customContract.functions.decimals();
        const newCustTokBalFormatted = ethers.utils.formatUnits(newCustTokenBalance[0], newTokDecimals);
        console.log('tokBal', newCustTokBalFormatted);
        setCustTokenSymbol(newCustTokenSymbol);
        setCustTokenName(newCustTokenName);
        setCustTokenBalance(newCustTokBalFormatted);
        setTokDecimals(newTokDecimals);
        setTokenMenuVisibility(true)
      } else {
        setCustTokenSymbol('');
        setCustTokenName('');
        setCustTokenBalance('');
        setTokenMenuVisibility(false)
      }
      console.log("customtokenaddress", customTokenAddress);
    }
  }

  useEffect(() => {
    isWalletConnectTransaction && createTransaction();
    setIsWalletConnectTransaction(false);
  }, [isWalletConnectTransaction]);

  var res;

  const getSortedSigList = async (allSigs, newHash) => {
    const sigList = [];
    for (const sig in allSigs) {
      const recover = await readContracts[contractName].recover(newHash, allSigs[sig]);
      sigList.push({ signature: allSigs[sig], signer: recover });
    }

    sigList.sort((a, b) => {
      return ethers.BigNumber.from(a.signer).sub(ethers.BigNumber.from(b.signer));
    });

    const finalSigList = [];
    const finalSigners = [];
    const used = {};
    for (const sig in sigList) {
      if (!used[sigList[sig].signature]) {
        finalSigList.push(sigList[sig].signature);
        finalSigners.push(sigList[sig].signer);
      }
      used[sigList[sig].signature] = true;
    }

    return [finalSigList, finalSigners];
  };

  const sendTransaction = async () => {
    const newHash = await readContracts[contractName].getTransactionHash(
      res.nonce,
      res.to,
      parseEther("" + parseFloat(res.amount).toFixed(12)),
      res.data,
    );

    const [finalSigList, finalSigners] = await getSortedSigList(res.signatures, newHash);

    console.log("writeContracts: ", res.to, parseEther("" + parseFloat(res.amount).toFixed(12)), res.data, finalSigList);

    tx(
      writeContracts[contractName].executeTransaction(
        res.to,
        parseEther("" + parseFloat(res.amount).toFixed(12)),
        res.data,
        finalSigList,
      ),
    );
  };

  const createTransaction = async () => {
    try {

      setLoading(true)
      let callData;
      let executeToAddress;
      if (methodName1 == "transferFunds" || methodName1 == "customCallData" || methodName1 == "wcCallData" || methodName1 == "erc20Transaction") {
        callData = methodName1 == "transferFunds" ? "0x" : methodName1 == "erc20Transaction" ? iface.encodeFunctionData(methodName2,[transferToAddress, formattedTransferAmount]) : customCallData;
        executeToAddress = to;
      } else {
        callData = readContracts[contractName]?.interface?.encodeFunctionData(methodName1, [to, newSignaturesRequired]);
        executeToAddress = contractAddress;
      }

      const newHash = await readContracts[contractName].getTransactionHash(
        nonce.toNumber(),
        executeToAddress,
        parseEther("" + parseFloat(amount).toFixed(12)),
        callData,
      );

      const signature = await userSigner?.signMessage(ethers.utils.arrayify(newHash));
      console.log("signature: ", signature);

      const recover = await readContracts[contractName].recover(newHash, signature);
      console.log("recover: ", recover);

      const isOwner = await readContracts[contractName].isOwner(recover);
      console.log("isOwner: ", isOwner);

      if (isOwner || true) {
        res =  {
          chainId: localProvider._network.chainId,
          address: readContracts[contractName]?.address,
          nonce: nonce.toNumber(),
          to: executeToAddress,
          amount,
          data: callData,
          hash: newHash,
          signatures: [signature],
          signers: [recover],
        };

        console.log("RESULT", res);
        setTimeout(() => {
          sendTransaction();
          setLoading(false);
        }, 1000);
      } else {
        console.log("ERROR, NOT OWNER.");
      }



    } catch(error) {
      console.log("Error: ", error);
      setLoading(false);
    }
  };


  return (
    <div>

      <div style={{ border: "1px solid #cccccc", padding: 16, width: 420, margin: "auto", marginTop: 8 }}>
        <div style={{ margin: 8 }}>
          <div style={{ margin: 8, padding: 8 }}>
            <Select value={methodName1} style={{ width: "100%" }} onChange={setMethodName1}>
              <Option key="transferFunds">Send ETH</Option>
              <Option key="customCallData">Custom Call Data</Option>
              <Option key="erc20Transaction">ERC20 Transaction</Option>
              <Option key="wcCallData">
                <img src="walletconnect-logo.svg" style={{ height: 20, width: 20 }} /> WalletConnect
              </Option>
            </Select>
          </div>
          {methodName1 == "wcCallData" ? (
            <div style={inputStyle}>
              <WalletConnectInput
                chainId={localProvider?._network.chainId}
                address={contractAddress}
                loadWalletConnectData={loadWalletConnectData}
                mainnetProvider={mainnetProvider}
                price={price}
              />
            </div>
          ) : (
            <>
              <div style={inputStyle}>
                <AddressInput
                  autoFocus
                  ensProvider={mainnetProvider}
                  placeholder={methodName1 == "transferFunds" ? "Recepient address" : "Owner address"}
                  value={to}
                  onChange={handleAddressChange}
                />
              </div>
              {tokenMenuVisibility && methodName1 == "erc20Transaction" &&
                <div style={{ clear: "both", width: 350, margin: "auto" , position:"relative" }}>
                  <h3>Symbol: &nbsp; {custTokenSymbol} &nbsp;&nbsp;&nbsp; Name: &nbsp; {custTokenName}</h3>
                  <h4>Balance: &nbsp; {custTokenBalance}</h4>
                  <div style={{margin:8,padding:8}}>
                    <Select value={methodName2} style={{ width: "100%" }} onChange={ setMethodName2 }>
                      <Option key="transfer">Transfer</Option>
                      <Option key="approve">Approve</Option>
                    </Select>
                  </div>
                  <div style={{margin:8,padding:8}}>
                    <AddressInput
                      autoFocus
                      ensProvider={mainnetProvider}
                      placeholder={methodName2 == "transfer" ? "to" : "spender"}
                      value={transferToAddress}
                      onChange={setTransferToAddress}
                    />
                  </div>
                  <div style={{margin:8,padding:8}}>
                    <Input
                      ensProvider={mainnetProvider}
                      placeholder="amount"
                      value={transferAmount}
                      onChange={handleTransferAmount}
                    />
                  </div>
                </div>
              }
              <div style={inputStyle}>
                {methodName1 == "customCallData" &&
                  <>
                    <Input.Group compact>
                      <Input
                        style={{ width: 'calc(100% - 31px)', marginBottom: 20 }}
                        placeholder="Custom call data"
                        value={customCallData}
                        onChange={e => {
                          setCustomCallData(e.target.value);
                        }}
                      />
                      <Tooltip title="Parse transaction data">
                        <Button onClick={showModal} icon={<CodeOutlined />} />
                      </Tooltip>
                    </Input.Group>
                    <TransactionDetailsModal
                      visible={isModalVisible}
                      txnInfo={parsedCustomCallData}
                      handleOk={() => setIsModalVisible(false)}
                      handleCancel={() => setIsModalVisible(false)}
                      mainnetProvider={mainnetProvider}
                      price={price}
                    />
                  </>
                }{/*would be badass to use this imput for erc20txns, and feed in the current price for that token*/}
                {(methodName1 == "transferFunds" || methodName1 == "customCallData") &&
                  <EtherInput
                    price={price}
                    mode="USD"
                    value={amount}
                    onChange={setAmount}
                  />
                }
              </div>
              <Space style={{ marginTop: 32 }}>
                <Button
                  loading={loading}
                  onClick={createTransaction}
                  type="primary"
                >
                  Send
                </Button>
              </Space>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

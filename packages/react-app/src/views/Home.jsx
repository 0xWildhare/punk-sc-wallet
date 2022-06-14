
import React, { useState } from "react";
import { Input, Button, } from "antd";
import { CaretUpOutlined, SendOutlined, } from "@ant-design/icons";
import { parseEther } from "@ethersproject/units";
import {
  AddressInput,
  EtherInput,
  QRPunkBlockie,
  Balance,
} from "../components";
import { useLocalStorage, } from "../hooks";
import {
  useBalance,
} from "eth-hooks";

export default function Home({
  address,
  localProvider,
  price,
  value,
  token,
  setAmount,
  loading,
  targetNetwork,
  amount,
  setConnected,
  connected,
  wallectConnectConnector,
  mainnetProvider,
  toAddress,
  setToAddress,
  scanner,
  selectedChainId,
  gasPrice,
  tx,
  setData,
  setLoading,
  walletConnectUrl,
  setWalletConnectUrl,

}) {

  const [walletConnectTx, setWalletConnectTx] = useState();


  return (
    <div>
      <div style={{ clear: "both", opacity: 1, width: 500, margin: "auto",position:"relative" }}>
        <Balance provider={localProvider} address={address} size={12+window.innerWidth/16} price={price} />

      </div>
      <div style={{ padding: 16, cursor: "pointer", backgroundColor: "#FFFFFF", width: 420, margin: "auto" }}>
        <QRPunkBlockie
          withQr
          address={address}
          showAddress={true}
        />
      </div>
      <div style={{ position: "relative", width: 320, margin: "auto", textAlign: "center", marginTop: 32 }}>
        <div style={{ padding: 10 }}>
          <AddressInput
            ensProvider={mainnetProvider}
            placeholder="to address"
            disabled={walletConnectTx}
            value={toAddress}
            onChange={setToAddress}
            hoistScanner={toggle => {
              scanner = toggle;
            }}
            walletConnect={(wcLink)=>{

              if(walletConnectUrl){
                //existing session... need to kill it and then connect new one....
                setConnected(false);
                if(wallectConnectConnector) wallectConnectConnector.killSession();
                localStorage.removeItem("walletConnectUrl")
                localStorage.removeItem("wallectConnectConnectorSession")
                localStorage.setItem("wallectConnectNextSession",wcLink)
              }else{
                setWalletConnectUrl(wcLink)
              }

            }}
          />
        </div>

        <div style={{ padding: 10 }}>
          {walletConnectTx ? <Input disabled={true} value={amount}/>:<EtherInput
            price={price}
            value={value}
            token={token}
            onChange={value => {
              setAmount(value);
            }}
          />}

        </div>

        <div style={{ padding: 10 }}>
          <Button
            key="submit"
            type="primary"
            disabled={loading || !amount || !toAddress}
            loading={loading}
            onClick={async () => {
              setLoading(true);

              let value;
              try {

                console.log("PARSE ETHER",amount)
                value = parseEther("" + amount);
                console.log("PARSEDVALUE",value)
              } catch (e) {
                const floatVal = parseFloat(amount).toFixed(8);

                console.log("floatVal",floatVal)
                // failed to parseEther, try something else
                value = parseEther("" + floatVal);
                console.log("PARSEDfloatVALUE",value)
              }

              let txConfig = {
                to: toAddress,
                chainId: selectedChainId,
                value,
              }

              if(targetNetwork.name=="arbitrum"){
                //txConfig.gasLimit = 21000;
                //ask rpc for gas price
              }else if(targetNetwork.name=="optimism"){
                //ask rpc for gas price
              }else if(targetNetwork.name=="gnosis"){
                //ask rpc for gas price
              }else if(targetNetwork.name=="polygon"){
                  //ask rpc for gas price
              }else{
                txConfig.gasPrice = gasPrice
              }

              console.log("SEND AND NETWORK",targetNetwork)
              let result = tx(txConfig);
              // setToAddress("")
              setAmount("");
              setData("");
              result = await result;
              console.log(result);
              setLoading(false);
            }}
          >
            {loading || !amount || !toAddress ? <CaretUpOutlined /> : <SendOutlined style={{ color: "#FFFFFF" }} />}{" "}
            Send
          </Button>
        </div>
        <div style={{ zIndex: -1, paddingTop: 32, opacity: 0.5, fontSize: 12 }}>
          <Button
            style={{ margin:8, marginTop: 16 }}
            onClick={() => {
              window.open("https://zapper.fi/account/"+address+"?tab=history");
            }}
          >
            <span style={{ marginRight: 8 }}>📜</span>History
          </Button>

          <Button
            style={{  margin:8, marginTop: 16, }}
            onClick={() => {
              window.open("https://zapper.fi/account/"+address);
            }}
          >
            <span style={{ marginRight: 8 }}>👛</span> Inventory
          </Button>
        </div>
      </div>
      <div style={{ clear: "both", width: 500, margin: "auto" ,marginTop:32, position:"relative"}}>
        {connected?<span style={{cursor:"pointer",padding:8,fontSize:30,position:"absolute",top:-16,left:28}}>✅</span>:""}
        <Input
          style={{width:"70%"}}
          placeholder={"wallet connect url (or use the scanner-->)"}
          value={walletConnectUrl}
          disabled={connected}
          onChange={(e)=>{
            setWalletConnectUrl(e.target.value)
          }}
          />
        {connected?<span style={{cursor:"pointer",padding:10,fontSize:30,position:"absolute", top:-18}} onClick={()=>{
          setConnected(false);
          if(wallectConnectConnector) wallectConnectConnector.killSession();
          localStorage.removeItem("walletConnectUrl")
          localStorage.removeItem("wallectConnectConnectorSession")
        }}>🗑</span>:""}
      </div>
    </div>
  );
};

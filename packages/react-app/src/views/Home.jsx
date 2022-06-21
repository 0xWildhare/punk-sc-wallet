import React from "react";
import {
  Balance,
  Address,
  TransactionListItem,
  Owners,
  QRPunkBlockie,
  CreateTransaction
 } from "../components";
import QR from "qrcode.react";
import { List, Button } from "antd";

export default function Home({
  contractAddress,
  localProvider,
  price,
  mainnetProvider,
  blockExplorer,
  executeTransactionEvents,
  contractName,
  readContracts,
  ownerEvents,
  signaturesRequired,
  poolServerUrl,
  tx,
  userSigner,
  DEBUG,
  nonce,
  writeContracts,
}) {
  return (
    <>
      <div style={{ padding: 24, maxWidth: 850, margin: "auto" }}>
        <div style={{ paddingBottom: 16 }}>
          <div>
            <Balance
              address={contractAddress ? contractAddress : ""}
              provider={localProvider}
              dollarMultiplier={price}
              size={64}
            />
          </div>
          <div style={{ padding: 16, cursor: "pointer", backgroundColor: "#FFFFFF", width: 420, margin: "auto" }}>
            <QRPunkBlockie
              withQr
              address={contractAddress}
              showAddress={true}
            />
          </div>
          <div style={{ paddingTop: 42, paddingBottom: 69 }}>
          <CreateTransaction
            poolServerUrl={poolServerUrl}
            contractName={contractName}
            contractAddress={contractAddress}
            mainnetProvider={mainnetProvider}
            localProvider={localProvider}
            price={price}
            tx={tx}
            readContracts={readContracts}
            userSigner={userSigner}
            DEBUG={DEBUG}
            nonce={nonce}
            blockExplorer={blockExplorer}
            signaturesRequired={signaturesRequired}
            tx={tx}
            writeContracts={writeContracts}
          />
          </div>
        </div>
        {/* Maybe this goes on another page
        <div style={{padding:32}}>
          <Owners
            ownerEvents={ownerEvents}
            signaturesRequired={signaturesRequired}
            mainnetProvider={mainnetProvider}
            blockExplorer={blockExplorer}
          />
        </div>*/}

        {/* Also probably for another page
          <List
          bordered
          dataSource={executeTransactionEvents}
          renderItem={item => {
            return (
              <TransactionListItem
                item={Object.create(item)}
                mainnetProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                price={price}
                readContracts={readContracts}
                contractName={contractName}
              />
            );
          }}
        />*/}
      </div>


    </>
  );
}

import React from "react";
import { TransactionListItem, } from "../components";
import { List, Button, Col, Row } from "antd";

export default function History({
  price,
  mainnetProvider,
  blockExplorer,
  executeTransactionEvents,
  contractName,
  readContracts,
  address,
  contractAddress,
}) {
  return (
    <>
      <div style={{ padding: 24, maxWidth: 850, margin: "auto" }}>
        <div style={{ zIndex: -1, paddingTop: 16, paddingBottom: 8, opacity: 0.5, fontSize: 12 }}>
          <Row  justify="center">
            <Col sm={12} xs={24}>
              For SC wallet:
              <br />
              <Button
                style={{ margin:8, marginTop:8, marginBottom: 16 }}
                onClick={() => {
                  window.open("https://zapper.fi/account/"+contractAddress+"?tab=history");
                }}
              >
                <span style={{ marginRight: 8 }}>📜</span>History
              </Button>

              <Button
                style={{  margin:8, marginTop:8, marginBottom: 16, }}
                onClick={() => {
                  window.open("https://zapper.fi/account/"+contractAddress);
                }}
              >
                <span style={{ marginRight: 8 }}>👛</span> Inventory
              </Button>
            </Col>
            <Col sm={12} xs={24}>
              For Burner:
              <br />
              <Button
                style={{ margin:8, marginTop:8,marginBottom: 16 }}
                onClick={() => {
                  window.open("https://zapper.fi/account/"+address+"?tab=history");
                }}
              >
                <span style={{ marginRight: 8 }}>📜</span>History
              </Button>

              <Button
                style={{  margin:8, marginTop:8, marginBottom: 16, }}
                onClick={() => {
                  window.open("https://zapper.fi/account/"+address);
                }}
              >
                <span style={{ marginRight: 8 }}>👛</span> Inventory
              </Button>
            </Col>
          </Row>
        </div>
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
        />
      </div>


    </>
  );
}

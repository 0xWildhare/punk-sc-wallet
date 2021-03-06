import React, { useEffect } from "react";
import { Select, List, Spin, Collapse } from "antd";
import { Address } from "..";

const { Panel } = Collapse;

export default function Owners({
  ownerEvents,
  signaturesRequired,
  mainnetProvider,
  blockExplorer,
  category,
  showSigners,
}) {
  const [heading, funcArg] = category;
  const owners = new Set();
  const prevOwners = new Set();
  ownerEvents.forEach((ownerEvent) => {
    if (ownerEvent.args.added) {
      owners.add(ownerEvent.args[funcArg]);
      //args.owner stupid
      prevOwners.delete(ownerEvent.args[funcArg])
    } else {
      prevOwners.add(ownerEvent.args[funcArg])
      owners.delete(ownerEvent.args[funcArg]);
    }
  });

  return (
    <div>
      {showSigners ? <h2 style={{marginTop:8}}>Signatures Required: {signaturesRequired ? signaturesRequired.toNumber() :<Spin></Spin>}</h2> : <h2 style={{marginTop:8}}>&nbsp;</h2>}
      <List
        key={heading}
        header={<h2>{heading}</h2>}
        style={{maxWidth:250, margin:"auto", marginTop:16}}
        bordered
        dataSource={[...owners]}
        renderItem={(ownerAddress) => {
          return (
            <List.Item key={heading + ownerAddress}>

              <Address
                address={ownerAddress}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                fontSize={24}
              />
            </List.Item>
          )
        }}
      />

      <Collapse collapsible={prevOwners.size == 0 ? "disabled" : ""} style={{maxWidth:250, margin:"auto", marginTop:10}}>
        <Panel header={"Previous "+heading} key="1">
          <List
            dataSource={[...prevOwners]}
            renderItem={(prevOwnerAddress) => {
              return (
                <List.Item key={"owner_" + prevOwnerAddress}>
                  <Address
                    address={prevOwnerAddress}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={24}
                  />
                </List.Item>
              )
            }}
          />
        </Panel>
      </Collapse>
    </div>
  );
}

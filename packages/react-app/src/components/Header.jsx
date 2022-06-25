import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

// displays a page header

export default function Header(props) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1.2rem" }}>
      <div style={{ display: "flex",  flex: 1, flexWrap: "wrap", alignItems: "center" }}>
        <Title level={4} style={{ margin: "0 0.5rem 0 0" }}>👛 Punk SC Wallet</Title>
        <a href="https://github.com/0xWildhare/punk-sc-wallet" target="_blank">please fork this</a>
      </div>
      {props.children}
    </div>
  );
}

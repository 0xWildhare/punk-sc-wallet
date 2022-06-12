import React from "react";
import { Select } from "antd";

function NetworkSwitch({ NETWORKS, targetNetwork }) {
  const options = [];
  for (const id in NETWORKS) {
    options.push(
      <Select.Option key={id} value={NETWORKS[id].name}>
        <span style={{ color: NETWORKS[id].color, fontSize: 24 }}>{NETWORKS[id].name}</span>
      </Select.Option>,
    );
  }

  return (
    <Select
      defaultValue={targetNetwork.name}
      style={{ textAlign: "left", width: 170, fontSize: 20, paddingLeft: 10 }}
      onChange={value => {
        if (targetNetwork.chainId != NETWORKS[value].chainId) {
          window.localStorage.setItem("network", value);
          setTimeout(() => {
            window.location.reload();
          }, 1);
        }
      }}
    >
      {options}
    </Select>
  );
}


export default NetworkSwitch;

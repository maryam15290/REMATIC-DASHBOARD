import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Dashboard from "./components/Dashboard";
import { loginWeb3 } from "./utils/web3";
import { ethers } from "ethers";

function App() {
  const [provider, setProvider] = useState<any>();
  useEffect(() => {
    if (window.ethereum) {
      loginWeb3();
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );

      setProvider(provider);

      window.ethereum.on("accountsChanged", function (accounts: string[]) {
        if (accounts[0]) {
          window.location.reload();
        } else if (accounts[0] === undefined) {
          window.location.reload();
        }
      });

      window.ethereum.on("networkChanged", function (networkId: number) {
        window.location.reload();
      });
    }
  }, []);
  return <Dashboard provider={provider} />;
}

export default App;

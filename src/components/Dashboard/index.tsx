import React, { useEffect, useState } from "react";
import "./dashboard.css";
import logoImg from "../../assets/logo.png";
import { FaAddressBook, FaSearch, FaWallet } from "react-icons/fa";
import { validateAddress } from "../../utils";
import swal from "sweetalert";
import {
  changeNetwork,
  claim,
  fetchRMTXData,
  isClaim,
  loginWeb3,
} from "../../utils/web3";
import { Progress, Button, Modal, Radio, RadioChangeEvent } from "antd";
import NumberFormat from "react-number-format";

interface Holder {
  rmtxBalance: number;
  withdrawableReward: number;
  paidReward: number;
  nextCycleReward: number;
  totalReward: number;
  currentCycleStatus: string;
  busdEarned: any;
}

interface Props {
  provider: any;
}

const Dashboard = (props: Props) => {
  const [searchAddress, setSearchAddress] = useState("");
  const [address, setAddress] = useState<string>();
  const [holderData, setHolderData] = useState<Holder>();
  const [modalVisible, setModalVisible] = useState(false);
  const [claimable, setClaimable] = useState<boolean>(false);
  const [networkId, setNetworkId] = useState(56);
  const { provider } = props;

  const onNetworkChange = (e: RadioChangeEvent) => {
    setNetworkId(e.target.value);
  };

  useEffect(() => {
    if (provider) {
      loadWallet();
      checkClaimable();
    }
  }, [provider]);

  const searchData = async (address: string) => {
    if (validateAddress(address)) {
      const data = await fetchRMTXData(address);
      setHolderData(data);
    } else {
      swal("Error", "Wrong address type", "error");
    }
  };

  const checkClaimable = async () => {
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const checkClaim = await isClaim(signerAddress);
    setClaimable(Boolean(checkClaim));
  };

  const loadWallet = async () => {
    const signer = provider.getSigner();
    const { chainId } = await provider.getNetwork();
    const signerAddress = await signer.getAddress();
    setAddress(signerAddress);
    setNetworkId(chainId);
    searchData(signerAddress);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header px-4 d-flex justify-content-between align-items-center">
        <img src={logoImg} alt="" width={80} />
        <button
          className="text-uppercase network-btn"
          onClick={() => setModalVisible(true)}
        >
          Select network
        </button>
        <input
          type={"text"}
          placeholder="Enter your address.."
          className="p-2 wallet-address"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
        />
        <button className="view-btn" onClick={() => searchData(searchAddress)}>
          <FaSearch /> View
        </button>
        {address ? (
          <button className="connect-btn d-flex gap-2 justify-content-center align-items-center">
            {address.slice(0, 5) + "..." + address.slice(-5)}
          </button>
        ) : (
          <button
            className="connect-btn d-flex gap-2 justify-content-center align-items-center"
            onClick={() => loginWeb3()}
          >
            <FaWallet /> Connect Wallet
          </button>
        )}
      </div>
      <div className="h2 title pt-5">
        Please connect your wallet to view rewards
      </div>
      <div className="d-flex justify-content-center pt-5">
        <div className="rmtx-balance">
          <div> $RMTX BALANCE</div>
          <div>
            {" "}
            <NumberFormat
              value={holderData?.rmtxBalance}
              displayType={"text"}
              thousandSeparator={true}
            />{" "}
            RMTX
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between pt-2 rmtx-data pt-4">
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          id="item"
        >
          <div className="">Withdrawable Rewards</div>
          <div>
            <NumberFormat
              value={holderData?.withdrawableReward}
              displayType={"text"}
              thousandSeparator={true}
            />{" "}
            EGC
          </div>
        </div>
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          id="item"
        >
          <div className="">Paid Rewards</div>
          <div>
            <NumberFormat
              value={holderData?.paidReward}
              displayType={"text"}
              thousandSeparator={true}
            />{" "}
            EGC
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between pt-2 rmtx-data pt-4">
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          id="item"
        >
          <div className="">NEXT CYCLE Rewards</div>
          <div>
            {" "}
            <NumberFormat
              value={holderData?.nextCycleReward}
              displayType={"text"}
              thousandSeparator={true}
            />{" "}
            EGC
          </div>
        </div>

        <div
          className="d-flex flex-column align-items-center justify-content-center"
          id="item"
        >
          <div className="">Total Rewards</div>
          <div>{holderData?.totalReward} EGC</div>
        </div>
      </div>
      {networkId == 56 ? (
        <div className="d-flex justify-content-center pt-4">
          <div className="rmtx-balance">
            <div> BUSD earned from EGC</div>
            <div>$ {!holderData?.busdEarned ? 0 : holderData?.busdEarned}</div>
          </div>
        </div>
      ) : null}

      <div className="progressbar w-100 d-flex flex-column align-items-center justify-content-center pt-5">
        <div id="title">CURRENT CYCLE STATUS</div>
        <Progress
          percent={Number(holderData?.currentCycleStatus)}
          className="progress-bar"
          style={{ height: "20px" }}
        />
      </div>
      <div className="pt-4 d-flex justify-content-center">
        {claimable ? (
          <Button className="claim-btn" onClick={() => claim(String(address))}>
            Claim
          </Button>
        ) : (
          <div className="claim-text">
            You must wait until the next liquidation to claim again
          </div>
        )}
      </div>
      <Modal
        centered
        visible={modalVisible}
        onOk={() => {
          setModalVisible(false);
          changeNetwork(networkId);
        }}
        onCancel={() => setModalVisible(false)}
      >
        <Radio.Group onChange={onNetworkChange} value={networkId}>
          <Radio value={56}>Binace Smart Chain Network</Radio>
          <Radio value={137}>Polygon Network</Radio>
        </Radio.Group>
      </Modal>
    </div>
  );
};

export default Dashboard;

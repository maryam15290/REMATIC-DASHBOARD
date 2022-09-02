import { BigNumber, ethers, utils } from "ethers";
const RMTXABI = require("../abi/rmtx.json");
const RMTXTrackerABI = require("../abi/rmtx_tracker.json");
const DividendABI = require("../abi/dividend_distributor.json");
const REACT_BSC_RMTX_ADDRESS = "0x21d9Cb3F11a19323C9f222A30Cf9471430f4AB54";
const REACT_BSC_RMTX_TRACKER_ADDRESS =
  "0x83A81d1884c6F567fe80b5d2996a209C05561F09";
const REACT_DIVIDEND_DISTRIBUTOR = "0xfbab1d829e36efbd13642229eae2964004f38c41";

const REACT_POLY_RMTX_ADDRESS = "0x76a15a8628ce4c66629ea964f8dc796a8159170b";
const REACT_POLY_RMTX_TRACKER_ADDRESS =
  "0xcfb77b067fbee92ebc52e374f78ccf8358764ae4";
const REACT_POLY_DIVIDEND_DISTRIBUTOR =
  "0xCfb77b067FbeE92eBC52E374f78cCF8358764Ae4";

export const fetchRMTXData = async (address: string) => {
  try {
    if (!window.ethereum) {
      throw new Error("No wallet on the browser.");
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const { chainId } = await provider.getNetwork();

    const signer = provider.getSigner();
    const rmtxContract = new ethers.Contract(
      chainId == 56 ? REACT_BSC_RMTX_ADDRESS : REACT_POLY_RMTX_ADDRESS,
      RMTXABI,
      signer
    );

    const rmtxTrackerContract = new ethers.Contract(
      chainId == 56
        ? REACT_BSC_RMTX_TRACKER_ADDRESS
        : REACT_POLY_RMTX_TRACKER_ADDRESS,
      RMTXTrackerABI,
      signer
    );

    const dividendContract = new ethers.Contract(
      chainId == 56
        ? REACT_DIVIDEND_DISTRIBUTOR
        : REACT_POLY_DIVIDEND_DISTRIBUTOR,
      DividendABI,
      signer
    );

    const rmtxBalance = await rmtxContract.balanceOf(address);

    const withdrawableReward = await rmtxTrackerContract.holdersDividends(
      address
    );

    const paidReward = await rmtxTrackerContract.withdrawnDividendOf(address);
    const nextCycleReward = await rmtxTrackerContract.withdrawableDividendOf(
      address
    );

    const totalReward = paidReward + nextCycleReward;

    const lastProcessedIndex = await rmtxTrackerContract.lastProcessedIndex();
    const numberOfTokenHolders =
      await rmtxTrackerContract.getNumberOfTokenHolders();

    let busdEarned = 0;
    if (chainId == 56) {
      const busdEarnedData = await dividendContract.shares(address);
      busdEarned = busdEarnedData.totalRealised;
    }
    return {
      rmtxBalance: Number(rmtxBalance) / Math.pow(10, 18),
      withdrawableReward: Number(withdrawableReward) / Math.pow(10, 18),
      paidReward: Number(paidReward) / Math.pow(10, 18),
      nextCycleReward: Number(nextCycleReward) / Math.pow(10, 18),
      totalReward: Number(totalReward) / Math.pow(10, 18),
      currentCycleStatus: Number(
        (lastProcessedIndex / numberOfTokenHolders) * 100
      ).toFixed(2),
      busdEarned:
        chainId == 56 ? (Number(busdEarned) / Math.pow(10, 18)).toFixed(2) : 0,
    };
  } catch (err) {
    console.log(err);
  }
};

export const claim = async (address: string) => {
  try {
    if (!window.ethereum) {
      throw new Error("No wallet on the browser.");
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const rmtxTrackerContract = new ethers.Contract(
      REACT_BSC_RMTX_TRACKER_ADDRESS,
      RMTXTrackerABI,
      signer
    );

    const tx = await rmtxTrackerContract.claimDividEnd(address);
    await tx.wait();
  } catch (err) {
    console.log(err);
  }
};

export const loginWeb3 = async () => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
  }
};

export const changeNetwork = async (chainId: number) => {
  if (window.ethereum) {
    if (chainId == 56) {
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x38",
            rpcUrls: ["https://bsc-dataseed1.binance.org/"],
            chainName: "BSC Mainnet",
            nativeCurrency: {
              name: "BSC",
              symbol: "BNB",
              decimals: 18,
            },
            blockExplorerUrls: ["https://bscscan.com/"],
          },
        ],
      });
    } else if (chainId == 137) {
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x89",
            rpcUrls: ["https://rpc-mainnet.matic.network/"],
            chainName: "Matic Mainnet",
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18,
            },
            blockExplorerUrls: ["https://polygonscan.com/"],
          },
        ],
      });
    }
  }
};

export const isClaim = async (address: string) => {
  try {
    if (!window.ethereum) {
      throw new Error("No wallet on the browser.");
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const { chainId } = await provider.getNetwork();

    const signer = provider.getSigner();

    const rmtxTrackerContract = new ethers.Contract(
      chainId == 56
        ? REACT_BSC_RMTX_TRACKER_ADDRESS
        : REACT_POLY_RMTX_TRACKER_ADDRESS,
      RMTXTrackerABI,
      signer
    );

    const withdrawableReward = await rmtxTrackerContract.holdersDividends(
      address
    );

    return Number(withdrawableReward) == 0 ? false : true;
  } catch (err) {
    console.log(err);
  }
};

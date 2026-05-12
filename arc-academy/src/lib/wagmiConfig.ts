import { defineChain } from "viem";

export const arcTestnet = defineChain({
  id: 4891,
  name: "Arc Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ARC",
    symbol: "ARC",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://explorer.testnet.arc.network",
    },
  },
  testnet: true,
});

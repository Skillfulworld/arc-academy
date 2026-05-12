export const CERTIFICATE_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

export const CERTIFICATE_ABI = [
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "string", name: "courseName", type: "string" },
    ],
    name: "mintCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "hasCertificate",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const ARC_EXPLORER_TX = (hash: string) =>
  `https://explorer.testnet.arc.network/tx/${hash}`;

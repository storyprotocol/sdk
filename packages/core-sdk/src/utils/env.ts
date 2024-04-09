import { Hex } from "viem";

import { ContractAddress } from "../types/config";

const sepolia: Record<string, Hex> = {
  RoyaltyPolicyLAP: "0x16eF58e959522727588921A92e9084d36E5d3855",
};

const storyTestnet: Record<string, Hex> = {
  RoyaltyPolicyLAP: "0x31f263D48df5FA5956E2Ba614b150e2A0fE1aDd3",
};

export const contractAddress: ContractAddress = {
  sepolia,
  11155111: sepolia,
  storyTestnet,
  1513: storyTestnet,
};

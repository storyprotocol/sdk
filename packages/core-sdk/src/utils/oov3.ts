import { Address, PublicClient, Hex } from "viem";

import { ArbitrationPolicyUmaClient } from "../abi/generated";
import { ASSERTION_ABI } from "../abi/oov3Abi";

export const getOov3Contract = async (
  arbitrationPolicyUmaClient: ArbitrationPolicyUmaClient,
): Promise<Address> => {
  return await arbitrationPolicyUmaClient.oov3();
};
export const getAssertionDetails = async (
  rpcClient: PublicClient,
  arbitrationPolicyUmaClient: ArbitrationPolicyUmaClient,
  assertionId: Hex,
): Promise<bigint> => {
  const oov3Contract = await getOov3Contract(arbitrationPolicyUmaClient);
  const { bond } = await rpcClient.readContract({
    address: oov3Contract,
    abi: ASSERTION_ABI,
    functionName: "getAssertion",
    args: [assertionId],
  });

  return bond;
};

export const getMinimumBond = async (
  rpcClient: PublicClient,
  arbitrationPolicyUmaClient: ArbitrationPolicyUmaClient,
  currency: Address,
): Promise<bigint> => {
  const oov3Contract = await getOov3Contract(arbitrationPolicyUmaClient);
  return await rpcClient.readContract({
    address: oov3Contract,
    abi: ASSERTION_ABI,
    functionName: "getMinimumBond",
    args: [currency],
  });
};

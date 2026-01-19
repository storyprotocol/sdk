import { Address, createPublicClient, createWalletClient, Hex, http, PublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { aeneid } from "./chain";
import { handleError } from "./errors";
import { assertCurrencyAllowed, chainStringToViemChain } from "./utils";
import { ArbitrationPolicyUmaClient } from "../abi/generated";
import { ASSERTION_ABI } from "../abi/oov3Abi";
import { DisputeId } from "../types/resources/dispute";
import { SupportedChainIds } from "../types/config";

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
  chainId: SupportedChainIds,
): Promise<bigint> => {
  assertCurrencyAllowed(currency, chainId);
  const oov3Contract = await getOov3Contract(arbitrationPolicyUmaClient);
  return await rpcClient.readContract({
    address: oov3Contract,
    abi: ASSERTION_ABI,
    functionName: "getMinimumBond",
    args: [currency],
  });
};

/**
 * Settles an assertion associated with a dispute in the UMA arbitration protocol.
 *
 * This function takes a dispute ID, resolves it to an assertion ID, and then calls
 * the `settleAssertion` function on the Optimistic Oracle V3 contract to finalize
 * the arbitration outcome.
 *
 * The function is specifically designed for testing on the `aeneid` testnet and will
 * not work on other chains. It handles the entire settlement process including:
 * - Creating the appropriate clients with the provided private key
 * - Retrieving the assertion ID from the dispute ID
 * - Executing the settlement transaction
 * - Waiting for transaction confirmation
 *
 * @see https://docs.story.foundation/docs/uma-arbitration-policy#/
 * @see https://docs.uma.xyz/developers/optimistic-oracle-v3
 *
 * @param privateKey - The private key of the wallet that will sign the settlement transaction.
 * @param disputeId - The ID of the dispute to be settled.
 * @param transport - Optional custom RPC URL; defaults to the aeneid testnet RPC URL.
 * @returns A promise that resolves to the transaction hash of the settlement transaction.
 */
export const settleAssertion = async (
  privateKey: Hex,
  disputeId: DisputeId,
  transport?: string,
): Promise<Hex> => {
  try {
    const baseConfig = {
      chain: chainStringToViemChain("aeneid"),
      transport: http(transport ?? aeneid.rpcUrls.default.http[0]),
    };
    const rpcClient = createPublicClient(baseConfig);
    const walletClient = createWalletClient({
      ...baseConfig,
      account: privateKeyToAccount(privateKey),
    });
    const arbitrationPolicyUmaClient = new ArbitrationPolicyUmaClient(rpcClient, walletClient);
    const oov3Contract = await getOov3Contract(arbitrationPolicyUmaClient);
    const assertionId = await arbitrationPolicyUmaClient.disputeIdToAssertionId({
      disputeId: BigInt(disputeId),
    });
    const txHash = await walletClient.writeContract({
      address: oov3Contract,
      abi: ASSERTION_ABI,
      functionName: "settleAssertion",
      args: [assertionId],
    });
    await rpcClient.waitForTransactionReceipt({ hash: txHash });
    return txHash;
  } catch (error) {
    return handleError(error, "Failed to settle assertion");
  }
};

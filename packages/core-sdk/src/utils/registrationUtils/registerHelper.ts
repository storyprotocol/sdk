import { Address, Hash, Hex } from "viem";

import { TransactionResponse } from "../../types/options";
import { TransformIpRegistrationWorkflowResponse } from "../../types/resources/ipAsset";
import {
  AggregateRegistrationRequest,
  HandleMulticallConfig,
} from "../../types/utils/registerHelper";
import { contractCallWithFees } from "../feeUtils";
import { mergeSpenders } from "./registerValidation";
/**
 * Aggregates the registration requests for the given workflow responses.
 *
 * This function combines multiple workflow responses into a consolidated request structure,
 * aggregating:
 * - Token spenders and their allowances
 * - Total fees required for all operations
 * - Encoded transaction data
 * - Contract calls to be executed
 *
 * @remarks
 * The function handles two execution modes:
 * 1. If `disableMulticallWhenPossible` is true or a workflow response supports multicall3
 *    (indicated by `isUseMulticall3`), individual contract calls are added to the `contractCall` array.
 * 2. Otherwise, it concatenates all `encodedTxData` and passes them as parameters to the
 *    workflowClient's `multicall` method, optimizing gas usage by batching transactions.
 *
 * This approach allows for flexible transaction handling based on contract capabilities
 * and user preferences.
 */
const aggregateTransformIpRegistrationWorkflow = (
  transferWorkflowResponses: TransformIpRegistrationWorkflowResponse[],
  multicall3Address: Address,
  disableMulticallWhenPossible: boolean,
): AggregateRegistrationRequest => {
  const aggregateRegistrationRequest: AggregateRegistrationRequest = {};
  for (const res of transferWorkflowResponses) {
    const { spenders, totalFees, encodedTxData, workflowClient, isUseMulticall3 } = res;
    let shouldUseMulticall = isUseMulticall3;
    if (disableMulticallWhenPossible) {
      shouldUseMulticall = false;
    }

    // const shouldUseMulticall = !disableMulticallWhenPossible && isUseMulticall3;
    const targetAddress = shouldUseMulticall ? multicall3Address : workflowClient.address;
    if (!aggregateRegistrationRequest[targetAddress]) {
      aggregateRegistrationRequest[targetAddress] = {
        spenders: [],
        totalFees: 0n,
        encodedTxData: [],
        contractCall: [],
      };
    }

    const currentRequest = aggregateRegistrationRequest[targetAddress];
    currentRequest.spenders = mergeSpenders(currentRequest.spenders, spenders || []);
    currentRequest.totalFees += totalFees || 0n;
    currentRequest.encodedTxData = currentRequest.encodedTxData.concat(encodedTxData);
    if (isUseMulticall3 || disableMulticallWhenPossible) {
      currentRequest.contractCall = currentRequest.contractCall.concat(res.contractCall);
    } else {
      currentRequest.contractCall = [
        (): Promise<Hash> => {
          return workflowClient.multicall({
            data: currentRequest.encodedTxData.map((tx) => tx.data),
          });
        },
      ];
    }
  }

  return aggregateRegistrationRequest;
};

export const handleMulticall = async ({
  transferWorkflowResponses,
  multicall3Address,
  wipOptions,
  rpcClient,
  wallet,
  walletAddress,
}: HandleMulticallConfig): Promise<TransactionResponse[]> => {
  const aggregateRegistrationRequest = aggregateTransformIpRegistrationWorkflow(
    transferWorkflowResponses,
    multicall3Address,
    wipOptions?.useMulticallWhenPossible === false,
  );
  const txResponses: TransactionResponse[] = [];
  for (const key in aggregateRegistrationRequest) {
    const { spenders, totalFees, encodedTxData, contractCall } = aggregateRegistrationRequest[key];
    const contractCalls = async (): Promise<Hash[]> => {
      const txHashes: Hex[] = [];
      for (const call of contractCall) {
        const txHash = await call();
        txHashes.push(txHash);
      }
      return txHashes;
    };
    const useMulticallWhenPossible = key === multicall3Address ? true : false;
    const txResponse = await contractCallWithFees({
      totalFees,
      options: {
        wipOptions: {
          ...wipOptions,
          useMulticallWhenPossible,
        },
      },
      multicall3Address,
      rpcClient,
      tokenSpenders: spenders,
      contractCall: contractCalls,
      sender: walletAddress,
      wallet,
      encodedTxs: encodedTxData,
      txOptions: { waitForTransaction: true },
    });
    txResponses.push(...(Array.isArray(txResponse) ? txResponse : [txResponse]));
  }
  return txResponses;
};

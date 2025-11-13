import { Address, Hash, Hex } from "viem";

import { TransactionResponse } from "../../types/options";
import { TransformedIpRegistrationWorkflowRequest } from "../../types/resources/ipAsset";
import {
  AggregateRegistrationRequest,
  MulticallConfigRequest,
  MulticallConfigResponse,
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
  transferWorkflowRequests: TransformedIpRegistrationWorkflowRequest[],
  multicall3Address: Address,
  disableMulticallWhenPossible: boolean,
): AggregateRegistrationRequest => {
  const aggregateRegistrationRequest: AggregateRegistrationRequest = {};
  for (const res of transferWorkflowRequests) {
    const { spenders, encodedTxData, workflowClient, isUseMulticall3, extraData } = res;
    let shouldUseMulticall = isUseMulticall3;
    if (disableMulticallWhenPossible) {
      shouldUseMulticall = false;
    }

    const targetAddress = shouldUseMulticall ? multicall3Address : workflowClient.address;
    if (!aggregateRegistrationRequest[targetAddress]) {
      aggregateRegistrationRequest[targetAddress] = {
        spenders: [],
        encodedTxData: [],
        contractCall: [],
        extraData: [],
      };
    }

    const currentRequest = aggregateRegistrationRequest[targetAddress];
    currentRequest.spenders = mergeSpenders(currentRequest.spenders, spenders || []);
    currentRequest.encodedTxData = currentRequest.encodedTxData.concat(encodedTxData);
    currentRequest.extraData = currentRequest.extraData?.concat(extraData || undefined);
    //TODO:This condition have some issue
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
  transferWorkflowRequests,
  multicall3Address,
  options,
  rpcClient,
  wallet,
  walletAddress,
}: MulticallConfigRequest): Promise<MulticallConfigResponse> => {
  const aggregateRegistrationRequest = aggregateTransformIpRegistrationWorkflow(
    transferWorkflowRequests,
    multicall3Address,
    options?.wipOptions?.useMulticallWhenPossible === false,
  );
  const txResponses: TransactionResponse[] = [];
  for (const key in aggregateRegistrationRequest) {
    const { spenders, encodedTxData, contractCall } = aggregateRegistrationRequest[key];
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
      options: {
        ...options?.erc20Options,
        wipOptions: {
          ...options?.wipOptions,
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
    });
    txResponses.push(...(Array.isArray(txResponse) ? txResponse : [txResponse]));
  }
  return {
    response: txResponses,
    aggregateRegistrationRequest,
  };
};

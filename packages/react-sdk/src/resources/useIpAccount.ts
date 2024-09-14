import {
  IPAccountExecuteRequest,
  IPAccountExecuteResponse,
  IPAccountExecuteWithSigRequest,
  IPAccountExecuteWithSigResponse,
  IpAccountStateResponse,
} from "@story-protocol/core-sdk";
import { useState } from "react";

import { useStoryContext } from "../StoryProtocolContext";
import { withLoadingErrorHandling } from "../withLoadingErrorHandling";

const useIpAccount = () => {
  const client = useStoryContext();
  const [loadings, setLoadings] = useState<Record<string, boolean>>({
    execute: false,
    executeWithSig: false,
    getIpAccountNonce: false,
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({
    execute: null,
    executeWithSig: null,
    getIpAccountNonce: null,
  });

  /** Executes a transaction from the IP Account.
   * @param request - The request object containing necessary data to execute IP Account a transaction.
   *   @param request.ipId The Ip Id to get ip account.
   *   @param request.to The recipient of the transaction.
   *   @param request.value The amount of Ether to send.
   *   @param request.accountAddress The ipId to send.
   *   @param request.data The data to send along with the transaction.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns Tx hash for the transaction.
   */
  const execute = withLoadingErrorHandling<
    IPAccountExecuteRequest,
    IPAccountExecuteResponse
  >(
    "execute",
    client.ipAccount.execute.bind(client.ipAccount),
    setLoadings,
    setErrors
  );

  /** Executes a transaction from the IP Account.
   * @param request - The request object containing necessary data to execute IP Account a transaction.
   *   @param request.ipId The Ip Id to get ip account.
   *   @param request.to The recipient of the transaction.
   *   @param request.value The amount of Ether to send.
   *   @param request.data The data to send along with the transaction.
   *   @param request.signer The signer of the transaction.
   *   @param request.deadline The deadline of the transaction signature.
   *   @param request.signature The signature of the transaction, EIP-712 encoded.
   *   @param request.txOptions - [Optional] transaction. This extends `WaitForTransactionReceiptParameters` from the Viem library, excluding the `hash` property.
   * @returns Tx hash for the transaction.
   */
  const executeWithSig = withLoadingErrorHandling<
    IPAccountExecuteWithSigRequest,
    IPAccountExecuteWithSigResponse
  >(
    "executeWithSig",
    client.ipAccount.executeWithSig.bind(client.ipAccount),
    setLoadings,
    setErrors
  );

  /** Returns the IPAccount&#39;s internal nonce for transaction ordering.
   * @param ipId The IP ID
   * @returns The nonce for transaction ordering.
   */
  const getIpAccountNonce = withLoadingErrorHandling<
    string,
    IpAccountStateResponse
  >(
    "getIpAccountNonce",
    client.ipAccount.getIpAccountNonce.bind(client.ipAccount),
    setLoadings,
    setErrors
  );

  return {
    loadings,
    errors,
    execute,
    executeWithSig,
    getIpAccountNonce,
  };
};
export default useIpAccount;

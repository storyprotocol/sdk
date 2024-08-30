import {
  IPAccountExecuteRequest,
  IPAccountExecuteResponse,
  IPAccountExecuteWithSigRequest,
  IPAccountExecuteWithSigResponse,
  IpAccountStateResponse,
} from "@story-protocol/core-sdk";
import { useState } from "react";

import { useStoryContext } from "../StoryProtocolContext";
import { handleError } from "../util";

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
  const execute = async (
    request: IPAccountExecuteRequest
  ): Promise<IPAccountExecuteResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, execute: true }));
      setErrors((prev) => ({ ...prev, execute: null }));
      const response = await client.ipAccount.execute(request);
      setLoadings((prev) => ({ ...prev, execute: false }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({ ...prev, execute: errorMessage }));
      setLoadings((prev) => ({ ...prev, execute: false }));
      throw new Error(errorMessage);
    }
  };

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
  const executeWithSig = async (
    request: IPAccountExecuteWithSigRequest
  ): Promise<IPAccountExecuteWithSigResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, executeWithSig: true }));
      setErrors((prev) => ({ ...prev, executeWithSig: null }));
      const response = await client.ipAccount.executeWithSig(request);
      setLoadings((prev) => ({ ...prev, executeWithSig: false }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({ ...prev, executeWithSig: errorMessage }));
      setLoadings((prev) => ({ ...prev, executeWithSig: false }));
      throw new Error(errorMessage);
    }
  };

  /** Returns the IPAccount&#39;s internal nonce for transaction ordering.
   * @param ipId The IP ID
   * @returns The nonce for transaction ordering.
   */
  const getIpAccountNonce = async (
    ipId: string
  ): Promise<IpAccountStateResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, getIpAccountNonce: true }));
      setErrors((prev) => ({ ...prev, getIpAccountNonce: null }));
      const response = await client.ipAccount.getIpAccountNonce(ipId);
      setLoadings((prev) => ({ ...prev, getIpAccountNonce: false }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({ ...prev, getIpAccountNonce: errorMessage }));
      setLoadings((prev) => ({ ...prev, getIpAccountNonce: false }));
      throw new Error(errorMessage);
    }
  };

  return {
    loadings,
    errors,
    execute,
    executeWithSig,
    getIpAccountNonce,
  };
};
export default useIpAccount;

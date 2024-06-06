import {
  IPAccountExecuteRequest,
  IPAccountExecuteResponse,
  IPAccountExecuteWithSigRequest,
  IPAccountExecuteWithSigResponse,
  IpAccountImplStateResponse,
} from "@story-protocol/core-sdk";
import { useState } from "react";

import { useStoryContext } from "../storyProtocolContext";

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
      if (e instanceof Error) {
        setErrors((prev) => ({ ...prev, execute: e.message }));
        setLoadings((prev) => ({ ...prev, execute: false }));
      }
      throw new Error(`unhandled error type`);
    }
  };

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
      if (e instanceof Error) {
        setErrors((prev) => ({ ...prev, executeWithSig: e.message }));
        setLoadings((prev) => ({ ...prev, executeWithSig: false }));
      }
      throw new Error(`unhandled error type`);
    }
  };

  const getIpAccountNonce = async (
    ipId: string
  ): Promise<IpAccountImplStateResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, getIpAccountNonce: true }));
      setErrors((prev) => ({ ...prev, getIpAccountNonce: null }));
      const response = await client.ipAccount.getIpAccountNonce(ipId);
      setLoadings((prev) => ({ ...prev, getIpAccountNonce: false }));
      return response;
    } catch (e) {
      if (e instanceof Error) {
        setErrors((prev) => ({ ...prev, getIpAccountNonce: e.message }));
        setLoadings((prev) => ({ ...prev, getIpAccountNonce: false }));
      }
      throw new Error(`unhandled error type`);
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

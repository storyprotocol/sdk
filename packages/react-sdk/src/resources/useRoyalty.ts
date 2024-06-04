import { 
CollectRoyaltyTokensRequest,
CollectRoyaltyTokensResponse,
PayRoyaltyOnBehalfRequest,
PayRoyaltyOnBehalfResponse,
ClaimableRevenueRequest,
ClaimRevenueRequest,
ClaimRevenueResponse,
SnapshotRequest,
SnapshotResponse 
} from "@story-protocol/core-sdk";

import { 
Hex 
  } from "viem"; 


import { useState } from "react";
import { useStoryContext } from "../storyProtocolContext";
export const useRoyalty = () => {
  const client = useStoryContext();
  const [loadings,setLoadings] = useState<Record<string,boolean>>({collectRoyaltyTokens: false, payRoyaltyOnBehalf: false, claimableRevenue: false, claimRevenue: false, snapshot: false, getRoyaltyVaultAddress: false });
  const [errors,setErrors] = useState<Record<string,string|null>>({ collectRoyaltyTokens: null,payRoyaltyOnBehalf: null,claimableRevenue: null,claimRevenue: null,snapshot: null,getRoyaltyVaultAddress: null });

const collectRoyaltyTokens = async (
  request: CollectRoyaltyTokensRequest
): Promise<CollectRoyaltyTokensResponse> => {
  try {
    setLoadings((prev) => ({ ...prev, collectRoyaltyTokens: true }));
    setErrors((prev) => ({ ...prev, collectRoyaltyTokens: null }));
    const response = await client.royalty.collectRoyaltyTokens(
      request
   );
    setLoadings((prev ) => ({ ...prev, collectRoyaltyTokens: false }));
    return response;
  }catch(e){
    if(e instanceof Error){
      setErrors((prev) => ({ ...prev, collectRoyaltyTokens: e.message }));
      setLoadings((prev) => ({ ...prev, collectRoyaltyTokens: false }));
    }
    throw new Error(`Unknown error type:${e}`);
  }
};

const payRoyaltyOnBehalf = async (
  request: PayRoyaltyOnBehalfRequest
): Promise<PayRoyaltyOnBehalfResponse> => {
  try {
    setLoadings((prev) => ({ ...prev, payRoyaltyOnBehalf: true }));
    setErrors((prev) => ({ ...prev, payRoyaltyOnBehalf: null }));
    const response = await client.royalty.payRoyaltyOnBehalf(
      request
   );
    setLoadings((prev ) => ({ ...prev, payRoyaltyOnBehalf: false }));
    return response;
  }catch(e){
    if(e instanceof Error){
      setErrors((prev) => ({ ...prev, payRoyaltyOnBehalf: e.message }));
      setLoadings((prev) => ({ ...prev, payRoyaltyOnBehalf: false }));
    }
    throw new Error(`Unknown error type:${e}`);
  }
};

const claimableRevenue = async (
  request: ClaimableRevenueRequest
): Promise<bigint> => {
  try {
    setLoadings((prev) => ({ ...prev, claimableRevenue: true }));
    setErrors((prev) => ({ ...prev, claimableRevenue: null }));
    const response = await client.royalty.claimableRevenue(
      request
   );
    setLoadings((prev ) => ({ ...prev, claimableRevenue: false }));
    return response;
  }catch(e){
    if(e instanceof Error){
      setErrors((prev) => ({ ...prev, claimableRevenue: e.message }));
      setLoadings((prev) => ({ ...prev, claimableRevenue: false }));
    }
    throw new Error(`Unknown error type:${e}`);
  }
};

const claimRevenue = async (
  request: ClaimRevenueRequest
): Promise<ClaimRevenueResponse> => {
  try {
    setLoadings((prev) => ({ ...prev, claimRevenue: true }));
    setErrors((prev) => ({ ...prev, claimRevenue: null }));
    const response = await client.royalty.claimRevenue(
      request
   );
    setLoadings((prev ) => ({ ...prev, claimRevenue: false }));
    return response;
  }catch(e){
    if(e instanceof Error){
      setErrors((prev) => ({ ...prev, claimRevenue: e.message }));
      setLoadings((prev) => ({ ...prev, claimRevenue: false }));
    }
    throw new Error(`Unknown error type:${e}`);
  }
};

const snapshot = async (
  request: SnapshotRequest
): Promise<SnapshotResponse> => {
  try {
    setLoadings((prev) => ({ ...prev, snapshot: true }));
    setErrors((prev) => ({ ...prev, snapshot: null }));
    const response = await client.royalty.snapshot(
      request
   );
    setLoadings((prev ) => ({ ...prev, snapshot: false }));
    return response;
  }catch(e){
    if(e instanceof Error){
      setErrors((prev) => ({ ...prev, snapshot: e.message }));
      setLoadings((prev) => ({ ...prev, snapshot: false }));
    }
    throw new Error(`Unknown error type:${e}`);
  }
};

const getRoyaltyVaultAddress = async (
  royaltyVaultIpId: Hex
): Promise<`0x${string}`> => {
  try {
    setLoadings((prev) => ({ ...prev, getRoyaltyVaultAddress: true }));
    setErrors((prev) => ({ ...prev, getRoyaltyVaultAddress: null }));
    const response = await client.royalty.getRoyaltyVaultAddress(
      royaltyVaultIpId
   );
    setLoadings((prev ) => ({ ...prev, getRoyaltyVaultAddress: false }));
    return response;
  }catch(e){
    if(e instanceof Error){
      setErrors((prev) => ({ ...prev, getRoyaltyVaultAddress: e.message }));
      setLoadings((prev) => ({ ...prev, getRoyaltyVaultAddress: false }));
    }
    throw new Error(`Unknown error type:${e}`);
  }
};

return {
  loadings,
  errors,
  collectRoyaltyTokens,
  payRoyaltyOnBehalf,
  claimableRevenue,
  claimRevenue,
  snapshot,
  getRoyaltyVaultAddress
  
};}
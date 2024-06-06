import { 
RaiseDisputeRequest,
RaiseDisputeResponse,
CancelDisputeRequest,
CancelDisputeResponse,
ResolveDisputeRequest,
ResolveDisputeResponse 
  } from "@story-protocol/core-sdk";
  
  
  import { useState } from "react";
  import { useStoryContext } from "../storyProtocolContext";
  const useDispute = () => {
    const client = useStoryContext();
    const [loadings,setLoadings] = useState<Record<string,boolean>>({raiseDispute: false, cancelDispute: false, resolveDispute: false });
    const [errors,setErrors] = useState<Record<string,string|null>>({ raiseDispute: null,cancelDispute: null,resolveDispute: null });
  
const raiseDispute = async (
    request: RaiseDisputeRequest
  ): Promise<RaiseDisputeResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, raiseDispute: true }));
      setErrors((prev) => ({ ...prev, raiseDispute: null }));
      const response = await client.dispute.raiseDispute(
        request
     );
      setLoadings((prev ) => ({ ...prev, raiseDispute: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, raiseDispute: e.message }));
        setLoadings((prev) => ({ ...prev, raiseDispute: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
const cancelDispute = async (
    request: CancelDisputeRequest
  ): Promise<CancelDisputeResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, cancelDispute: true }));
      setErrors((prev) => ({ ...prev, cancelDispute: null }));
      const response = await client.dispute.cancelDispute(
        request
     );
      setLoadings((prev ) => ({ ...prev, cancelDispute: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, cancelDispute: e.message }));
        setLoadings((prev) => ({ ...prev, cancelDispute: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
const resolveDispute = async (
    request: ResolveDisputeRequest
  ): Promise<ResolveDisputeResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, resolveDispute: true }));
      setErrors((prev) => ({ ...prev, resolveDispute: null }));
      const response = await client.dispute.resolveDispute(
        request
     );
      setLoadings((prev ) => ({ ...prev, resolveDispute: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, resolveDispute: e.message }));
        setLoadings((prev) => ({ ...prev, resolveDispute: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
return {
    loadings,
    errors,
    raiseDispute,
    cancelDispute,
    resolveDispute
    
  };}
export default useDispute;
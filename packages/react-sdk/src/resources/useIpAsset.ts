import { 
RegisterRequest,
RegisterIpResponse,
RegisterDerivativeRequest,
RegisterDerivativeResponse,
RegisterDerivativeWithLicenseTokensRequest,
RegisterDerivativeWithLicenseTokensResponse,
CreateIpAssetWithPilTermsRequest,
CreateIpAssetWithPilTermsResponse,
RegisterIpAndAttachPilTermsRequest,
RegisterIpAndAttachPilTermsResponse,
RegisterIpAndMakeDerivativeRequest,
RegisterIpAndMakeDerivativeResponse 
} from "@story-protocol/core-sdk";


import { useState } from "react";
import { useStoryContext } from "../storyProtocolContext";
export const useIpAsset = () => {
  const client = useStoryContext();
  const [loadings,setLoadings] = useState<Record<string,boolean>>({register: false, registerDerivative: false, registerDerivativeWithLicenseTokens: false, mintAndRegisterIpAssetWithPilTerms: false, registerIpAndAttachPilTerms: false, registerDerivativeIp: false });
  const [errors,setErrors] = useState<Record<string,string|null>>({ register: null,registerDerivative: null,registerDerivativeWithLicenseTokens: null,mintAndRegisterIpAssetWithPilTerms: null,registerIpAndAttachPilTerms: null,registerDerivativeIp: null });

const register = async (
  request: RegisterRequest
): Promise<RegisterIpResponse> => {
  try {
    setLoadings((prev) => ({ ...prev, register: true }));
    setErrors((prev) => ({ ...prev, register: null }));
    const response = await client.ipAsset.register(
      request
   );
    setLoadings((prev ) => ({ ...prev, register: false }));
    return response;
  }catch(e){
    if(e instanceof Error){
      setErrors((prev) => ({ ...prev, register: e.message }));
      setLoadings((prev) => ({ ...prev, register: false }));
    }
    throw new Error(`Unknown error type:${e}`);
  }
};

const registerDerivative = async (
  request: RegisterDerivativeRequest
): Promise<RegisterDerivativeResponse> => {
  try {
    setLoadings((prev) => ({ ...prev, registerDerivative: true }));
    setErrors((prev) => ({ ...prev, registerDerivative: null }));
    const response = await client.ipAsset.registerDerivative(
      request
   );
    setLoadings((prev ) => ({ ...prev, registerDerivative: false }));
    return response;
  }catch(e){
    if(e instanceof Error){
      setErrors((prev) => ({ ...prev, registerDerivative: e.message }));
      setLoadings((prev) => ({ ...prev, registerDerivative: false }));
    }
    throw new Error(`Unknown error type:${e}`);
  }
};

const registerDerivativeWithLicenseTokens = async (
  request: RegisterDerivativeWithLicenseTokensRequest
): Promise<RegisterDerivativeWithLicenseTokensResponse> => {
  try {
    setLoadings((prev) => ({ ...prev, registerDerivativeWithLicenseTokens: true }));
    setErrors((prev) => ({ ...prev, registerDerivativeWithLicenseTokens: null }));
    const response = await client.ipAsset.registerDerivativeWithLicenseTokens(
      request
   );
    setLoadings((prev ) => ({ ...prev, registerDerivativeWithLicenseTokens: false }));
    return response;
  }catch(e){
    if(e instanceof Error){
      setErrors((prev) => ({ ...prev, registerDerivativeWithLicenseTokens: e.message }));
      setLoadings((prev) => ({ ...prev, registerDerivativeWithLicenseTokens: false }));
    }
    throw new Error(`Unknown error type:${e}`);
  }
};

const mintAndRegisterIpAssetWithPilTerms = async (
  request: CreateIpAssetWithPilTermsRequest
): Promise<CreateIpAssetWithPilTermsResponse> => {
  try {
    setLoadings((prev) => ({ ...prev, mintAndRegisterIpAssetWithPilTerms: true }));
    setErrors((prev) => ({ ...prev, mintAndRegisterIpAssetWithPilTerms: null }));
    const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms(
      request
   );
    setLoadings((prev ) => ({ ...prev, mintAndRegisterIpAssetWithPilTerms: false }));
    return response;
  }catch(e){
    if(e instanceof Error){
      setErrors((prev) => ({ ...prev, mintAndRegisterIpAssetWithPilTerms: e.message }));
      setLoadings((prev) => ({ ...prev, mintAndRegisterIpAssetWithPilTerms: false }));
    }
    throw new Error(`Unknown error type:${e}`);
  }
};

const registerIpAndAttachPilTerms = async (
  request: RegisterIpAndAttachPilTermsRequest
): Promise<RegisterIpAndAttachPilTermsResponse> => {
  try {
    setLoadings((prev) => ({ ...prev, registerIpAndAttachPilTerms: true }));
    setErrors((prev) => ({ ...prev, registerIpAndAttachPilTerms: null }));
    const response = await client.ipAsset.registerIpAndAttachPilTerms(
      request
   );
    setLoadings((prev ) => ({ ...prev, registerIpAndAttachPilTerms: false }));
    return response;
  }catch(e){
    if(e instanceof Error){
      setErrors((prev) => ({ ...prev, registerIpAndAttachPilTerms: e.message }));
      setLoadings((prev) => ({ ...prev, registerIpAndAttachPilTerms: false }));
    }
    throw new Error(`Unknown error type:${e}`);
  }
};

const registerDerivativeIp = async (
  request: RegisterIpAndMakeDerivativeRequest
): Promise<RegisterIpAndMakeDerivativeResponse> => {
  try {
    setLoadings((prev) => ({ ...prev, registerDerivativeIp: true }));
    setErrors((prev) => ({ ...prev, registerDerivativeIp: null }));
    const response = await client.ipAsset.registerDerivativeIp(
      request
   );
    setLoadings((prev ) => ({ ...prev, registerDerivativeIp: false }));
    return response;
  }catch(e){
    if(e instanceof Error){
      setErrors((prev) => ({ ...prev, registerDerivativeIp: e.message }));
      setLoadings((prev) => ({ ...prev, registerDerivativeIp: false }));
    }
    throw new Error(`Unknown error type:${e}`);
  }
};

return {
  loadings,
  errors,
  register,
  registerDerivative,
  registerDerivativeWithLicenseTokens,
  mintAndRegisterIpAssetWithPilTerms,
  registerIpAndAttachPilTerms,
  registerDerivativeIp
  
};}
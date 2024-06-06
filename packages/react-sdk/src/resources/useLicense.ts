import { 
RegisterNonComSocialRemixingPILRequest,
RegisterPILResponse,
RegisterCommercialUsePILRequest,
RegisterCommercialRemixPILRequest,
AttachLicenseTermsRequest,
AttachLicenseTermsResponse,
MintLicenseTokensRequest,
MintLicenseTokensResponse,
LicenseTermsId,
PiLicenseTemplateGetLicenseTermsResponse 
  } from "@story-protocol/core-sdk";
  
  
  import { useState } from "react";
  import { useStoryContext } from "../storyProtocolContext";
  const useLicense = () => {
    const client = useStoryContext();
    const [loadings,setLoadings] = useState<Record<string,boolean>>({registerNonComSocialRemixingPIL: false, registerCommercialUsePIL: false, registerCommercialRemixPIL: false, attachLicenseTerms: false, mintLicenseTokens: false, getLicenseTerms: false });
    const [errors,setErrors] = useState<Record<string,string|null>>({ registerNonComSocialRemixingPIL: null,registerCommercialUsePIL: null,registerCommercialRemixPIL: null,attachLicenseTerms: null,mintLicenseTokens: null,getLicenseTerms: null });
  
const registerNonComSocialRemixingPIL = async (
    request: RegisterNonComSocialRemixingPILRequest
  ): Promise<RegisterPILResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, registerNonComSocialRemixingPIL: true }));
      setErrors((prev) => ({ ...prev, registerNonComSocialRemixingPIL: null }));
      const response = await client.license.registerNonComSocialRemixingPIL(
        request
     );
      setLoadings((prev ) => ({ ...prev, registerNonComSocialRemixingPIL: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, registerNonComSocialRemixingPIL: e.message }));
        setLoadings((prev) => ({ ...prev, registerNonComSocialRemixingPIL: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
const registerCommercialUsePIL = async (
    request: RegisterCommercialUsePILRequest
  ): Promise<RegisterPILResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, registerCommercialUsePIL: true }));
      setErrors((prev) => ({ ...prev, registerCommercialUsePIL: null }));
      const response = await client.license.registerCommercialUsePIL(
        request
     );
      setLoadings((prev ) => ({ ...prev, registerCommercialUsePIL: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, registerCommercialUsePIL: e.message }));
        setLoadings((prev) => ({ ...prev, registerCommercialUsePIL: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
const registerCommercialRemixPIL = async (
    request: RegisterCommercialRemixPILRequest
  ): Promise<RegisterPILResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, registerCommercialRemixPIL: true }));
      setErrors((prev) => ({ ...prev, registerCommercialRemixPIL: null }));
      const response = await client.license.registerCommercialRemixPIL(
        request
     );
      setLoadings((prev ) => ({ ...prev, registerCommercialRemixPIL: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, registerCommercialRemixPIL: e.message }));
        setLoadings((prev) => ({ ...prev, registerCommercialRemixPIL: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
const attachLicenseTerms = async (
    request: AttachLicenseTermsRequest
  ): Promise<AttachLicenseTermsResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, attachLicenseTerms: true }));
      setErrors((prev) => ({ ...prev, attachLicenseTerms: null }));
      const response = await client.license.attachLicenseTerms(
        request
     );
      setLoadings((prev ) => ({ ...prev, attachLicenseTerms: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, attachLicenseTerms: e.message }));
        setLoadings((prev) => ({ ...prev, attachLicenseTerms: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
const mintLicenseTokens = async (
    request: MintLicenseTokensRequest
  ): Promise<MintLicenseTokensResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, mintLicenseTokens: true }));
      setErrors((prev) => ({ ...prev, mintLicenseTokens: null }));
      const response = await client.license.mintLicenseTokens(
        request
     );
      setLoadings((prev ) => ({ ...prev, mintLicenseTokens: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, mintLicenseTokens: e.message }));
        setLoadings((prev) => ({ ...prev, mintLicenseTokens: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
const getLicenseTerms = async (
    selectedLicenseTermsId: LicenseTermsId
  ): Promise<PiLicenseTemplateGetLicenseTermsResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, getLicenseTerms: true }));
      setErrors((prev) => ({ ...prev, getLicenseTerms: null }));
      const response = await client.license.getLicenseTerms(
        selectedLicenseTermsId
     );
      setLoadings((prev ) => ({ ...prev, getLicenseTerms: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, getLicenseTerms: e.message }));
        setLoadings((prev) => ({ ...prev, getLicenseTerms: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
return {
    loadings,
    errors,
    registerNonComSocialRemixingPIL,
    registerCommercialUsePIL,
    registerCommercialRemixPIL,
    attachLicenseTerms,
    mintLicenseTokens,
    getLicenseTerms
    
  };}
export default useLicense;
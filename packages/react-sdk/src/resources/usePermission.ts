import { 
SetPermissionsRequest,
SetPermissionsResponse,
CreateSetPermissionSignatureRequest,
SetAllPermissionsRequest,
SetBatchPermissionsRequest,
CreateBatchPermissionSignatureRequest 
  } from "@story-protocol/core-sdk";
  
  
  import { useState } from "react";
  import { useStoryContext } from "../storyProtocolContext";
  const usePermission = () => {
    const client = useStoryContext();
    const [loadings,setLoadings] = useState<Record<string,boolean>>({setPermission: false, createSetPermissionSignature: false, setAllPermissions: false, setBatchPermissions: false, createBatchPermissionSignature: false });
    const [errors,setErrors] = useState<Record<string,string|null>>({ setPermission: null,createSetPermissionSignature: null,setAllPermissions: null,setBatchPermissions: null,createBatchPermissionSignature: null });
  
const setPermission = async (
    request: SetPermissionsRequest
  ): Promise<SetPermissionsResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, setPermission: true }));
      setErrors((prev) => ({ ...prev, setPermission: null }));
      const response = await client.permission.setPermission(
        request
     );
      setLoadings((prev ) => ({ ...prev, setPermission: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, setPermission: e.message }));
        setLoadings((prev) => ({ ...prev, setPermission: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
const createSetPermissionSignature = async (
    request: CreateSetPermissionSignatureRequest
  ): Promise<SetPermissionsResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, createSetPermissionSignature: true }));
      setErrors((prev) => ({ ...prev, createSetPermissionSignature: null }));
      const response = await client.permission.createSetPermissionSignature(
        request
     );
      setLoadings((prev ) => ({ ...prev, createSetPermissionSignature: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, createSetPermissionSignature: e.message }));
        setLoadings((prev) => ({ ...prev, createSetPermissionSignature: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
const setAllPermissions = async (
    request: SetAllPermissionsRequest
  ): Promise<SetPermissionsResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, setAllPermissions: true }));
      setErrors((prev) => ({ ...prev, setAllPermissions: null }));
      const response = await client.permission.setAllPermissions(
        request
     );
      setLoadings((prev ) => ({ ...prev, setAllPermissions: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, setAllPermissions: e.message }));
        setLoadings((prev) => ({ ...prev, setAllPermissions: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
const setBatchPermissions = async (
    request: SetBatchPermissionsRequest
  ): Promise<SetPermissionsResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, setBatchPermissions: true }));
      setErrors((prev) => ({ ...prev, setBatchPermissions: null }));
      const response = await client.permission.setBatchPermissions(
        request
     );
      setLoadings((prev ) => ({ ...prev, setBatchPermissions: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, setBatchPermissions: e.message }));
        setLoadings((prev) => ({ ...prev, setBatchPermissions: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
const createBatchPermissionSignature = async (
    request: CreateBatchPermissionSignatureRequest
  ): Promise<SetPermissionsResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, createBatchPermissionSignature: true }));
      setErrors((prev) => ({ ...prev, createBatchPermissionSignature: null }));
      const response = await client.permission.createBatchPermissionSignature(
        request
     );
      setLoadings((prev ) => ({ ...prev, createBatchPermissionSignature: false }));
      return response;
    }catch(e){
      if(e instanceof Error){
        setErrors((prev) => ({ ...prev, createBatchPermissionSignature: e.message }));
        setLoadings((prev) => ({ ...prev, createBatchPermissionSignature: false }));
      }
      throw new Error(`Unknown error type:${e}`);
    }
  };
  
return {
    loadings,
    errors,
    setPermission,
    createSetPermissionSignature,
    setAllPermissions,
    setBatchPermissions,
    createBatchPermissionSignature
    
  };}
export default usePermission;
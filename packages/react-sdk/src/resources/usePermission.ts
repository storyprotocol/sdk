import {
  SetPermissionsRequest,
  SetPermissionsResponse,
  CreateSetPermissionSignatureRequest,
  SetAllPermissionsRequest,
  SetBatchPermissionsRequest,
  CreateBatchPermissionSignatureRequest,
} from "@story-protocol/core-sdk";
import { useState } from "react";

import { useStoryContext } from "../StoryProtocolContext";
import { handleError } from "../util";

const usePermission = () => {
  const client = useStoryContext();
  const [loadings, setLoadings] = useState<Record<string, boolean>>({
    setPermission: false,
    createSetPermissionSignature: false,
    setAllPermissions: false,
    setBatchPermissions: false,
    createBatchPermissionSignature: false,
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({
    setPermission: null,
    createSetPermissionSignature: null,
    setAllPermissions: null,
    setBatchPermissions: null,
    createBatchPermissionSignature: null,
  });

  /**
   * Sets the permission for a specific function call
   * Each policy is represented as a mapping from an IP account address to a signer address to a recipient
   * address to a function selector to a permission level. The permission level can be 0 (ABSTAIN), 1 (ALLOW), or
   * 2 (DENY).
   * By default, all policies are set to 0 (ABSTAIN), which means that the permission is not set.
   * The owner of ipAccount by default has all permission.
   * address(0) =&gt; wildcard
   * bytes4(0) =&gt; wildcard
   * Specific permission overrides wildcard permission.
   * @param request - The request object containing necessary data to set `permission`.
   *   @param request.ipId The IP ID that grants the permission for `signer`.
   *   @param request.signer The address that can call `to` on behalf of the `ipAccount`.
   *   @param request.to The address that can be called by the `signer` (currently only modules can be `to`).
   *   @param request.permission The new permission level.
   *   @param request.func [Optional] The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`. Be default, it allows all functions.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  const setPermission = async (
    request: SetPermissionsRequest,
  ): Promise<SetPermissionsResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, setPermission: true }));
      setErrors((prev) => ({ ...prev, setPermission: null }));
      const response = await client.permission.setPermission(request);
      setLoadings((prev) => ({ ...prev, setPermission: false }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({ ...prev, setPermission: errorMessage }));
      setLoadings((prev) => ({ ...prev, setPermission: false }));
      throw new Error(errorMessage);
    }
  };

  /**
   * Specific permission overrides wildcard permission with signature.
   * @param request - The request object containing necessary data to set permissions.
   *   @param request.ipId The IP ID that grants the permission for `signer`
   *   @param request.signer The address that can call `to` on behalf of the `ipAccount`
   *   @param request.to The address that can be called by the `signer` (currently only modules can be `to`)
   *   @param request.permission The new permission level.
   *   @param request.func [Optional] The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`. Be default, it allows all functions.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds, default is 1000ms.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  const createSetPermissionSignature = async (
    request: CreateSetPermissionSignatureRequest,
  ): Promise<SetPermissionsResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, createSetPermissionSignature: true }));
      setErrors((prev) => ({ ...prev, createSetPermissionSignature: null }));
      const response =
        await client.permission.createSetPermissionSignature(request);
      setLoadings((prev) => ({ ...prev, createSetPermissionSignature: false }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({
        ...prev,
        createSetPermissionSignature: errorMessage,
      }));
      setLoadings((prev) => ({ ...prev, createSetPermissionSignature: false }));
      throw new Error(errorMessage);
    }
  };

  /**
   * Sets permission to a signer for all functions across all modules.
   * @param request - The request object containing necessary data to set all permissions.
   *   @param request.ipId The IP ID that grants the permission for `signer`
   *   @param request.signer The address of the signer receiving the permissions.
   *   @param request.permission The new permission.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  const setAllPermissions = async (
    request: SetAllPermissionsRequest,
  ): Promise<SetPermissionsResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, setAllPermissions: true }));
      setErrors((prev) => ({ ...prev, setAllPermissions: null }));
      const response = await client.permission.setAllPermissions(request);
      setLoadings((prev) => ({ ...prev, setAllPermissions: false }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({ ...prev, setAllPermissions: errorMessage }));
      setLoadings((prev) => ({ ...prev, setAllPermissions: false }));
      throw new Error(errorMessage);
    }
  };

  /**
   * Sets a batch of permissions in a single transaction.
   * @param request - The request object containing necessary data to set all permissions.
   * @param {Array} request.permissions - An array of `Permission` structure, each representing the permission to be set.
   *   @param request.permissions[].ipId The IP ID that grants the permission for `signer`.
   *   @param request.permissions[].signer The address that can call `to` on behalf of the `ipAccount`.
   *   @param request.permissions[].to The address that can be called by the `signer` (currently only modules can be `to`).
   *   @param request.permissions[].permission The new permission level.
   *   @param request.permissions[].func [Optional] The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`. Be default, it allows all functions.
   *   @param request.deadline [Optional] The deadline for the signature in milliseconds, default is 1000ms.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  const setBatchPermissions = async (
    request: SetBatchPermissionsRequest,
  ): Promise<SetPermissionsResponse> => {
    try {
      setLoadings((prev) => ({ ...prev, setBatchPermissions: true }));
      setErrors((prev) => ({ ...prev, setBatchPermissions: null }));
      const response = await client.permission.setBatchPermissions(request);
      setLoadings((prev) => ({ ...prev, setBatchPermissions: false }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({ ...prev, setBatchPermissions: errorMessage }));
      setLoadings((prev) => ({ ...prev, setBatchPermissions: false }));
      throw new Error(errorMessage);
    }
  };

  /**
   * Sets a batch of permissions in a single transaction with signature.
   * @param request - The request object containing necessary data to set permissions.
   *   @param request.ipId The IP ID that grants the permission for `signer`
   *   @param {Array} request.permissions - An array of `Permission` structure, each representing the permission to be set.
   *   @param request.permissions[].ipId The IP ID that grants the permission for `signer`.
   *   @param request.permissions[].signer The address that can call `to` on behalf of the `ipAccount`.
   *   @param request.permissions[].to The address that can be called by the `signer` (currently only modules can be `to`).
   *   @param request.permissions[].permission The new permission level.
   *   @param request.permissions[].func [Optional] The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`. Be default, it allows all functions.
   *   @param request.txOptions [Optional] The transaction options.
   * @returns A Promise that resolves to an object containing the transaction hash.
   * @emits PermissionSet (ipAccountOwner, ipAccount, signer, to, func, permission)
   */
  const createBatchPermissionSignature = async (
    request: CreateBatchPermissionSignatureRequest,
  ): Promise<SetPermissionsResponse> => {
    try {
      setLoadings((prev) => ({
        ...prev,
        createBatchPermissionSignature: true,
      }));
      setErrors((prev) => ({ ...prev, createBatchPermissionSignature: null }));
      const response =
        await client.permission.createBatchPermissionSignature(request);
      setLoadings((prev) => ({
        ...prev,
        createBatchPermissionSignature: false,
      }));
      return response;
    } catch (e) {
      const errorMessage = handleError(e);
      setErrors((prev) => ({
        ...prev,
        createBatchPermissionSignature: errorMessage,
      }));
      setLoadings((prev) => ({
        ...prev,
        createBatchPermissionSignature: false,
      }));
      throw new Error(errorMessage);
    }
  };

  return {
    loadings,
    errors,
    setPermission,
    createSetPermissionSignature,
    setAllPermissions,
    setBatchPermissions,
    createBatchPermissionSignature,
  };
};
export default usePermission;

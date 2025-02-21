import {
	SetPermissionsRequest,
	SetPermissionsResponse,
	CreateSetPermissionSignatureRequest,
	SetAllPermissionsRequest,
	SetBatchPermissionsRequest,
	CreateBatchPermissionSignatureRequest,
  } from "@story-protocol/core-sdk";
  import { useState, useCallback } from "react";
  import { useStoryContext } from "../StoryProtocolContext";
  import { withLoadingErrorHandling } from "../withLoadingErrorHandling";
  
  const usePermission = () => {
	const client = useStoryContext();
  
	// Manage loading states dynamically
	const [loadings, setLoadings] = useState<Record<string, boolean>>({});
	const [errors, setErrors] = useState<Record<string, string | null>>({});
  
	// Utility function to update loading/error states
	const setLoadingState = (key: string, isLoading: boolean) => {
	  setLoadings((prev) => ({ ...prev, [key]: isLoading }));
	};
  
	const setErrorState = (key: string, error: string | null) => {
	  setErrors((prev) => ({ ...prev, [key]: error }));
	};
  
	// Common error logging function (to send errors to a monitoring service)
	const logError = (key: string, error: any) => {
	  console.error(`[usePermission] ${key} failed:`, error);
	  setErrorState(key, error.message || "An error occurred");
	};
  
	// Helper function to wrap API calls with improved handling
	const createPermissionHandler = <T, R>(
	  key: string,
	  apiCall: (params: T) => Promise<R>
	) => {
	  return async (params: T) => {
		try {
		  setLoadingState(key, true);
		  const response = await apiCall(params);
		  return response;
		} catch (error) {
		  logError(key, error);
		  throw error; // Rethrow for component-level handling if needed
		} finally {
		  setLoadingState(key, false);
		}
	  };
	};
  
	// Generate permission handlers dynamically
	const permissionActions = {
	  setPermission: client.permission.setPermission.bind(client.permission),
	  createSetPermissionSignature:
		client.permission.createSetPermissionSignature.bind(client.permission),
	  setAllPermissions: client.permission.setAllPermissions.bind(client.permission),
	  setBatchPermissions: client.permission.setBatchPermissions.bind(client.permission),
	  createBatchPermissionSignature:
		client.permission.createBatchPermissionSignature.bind(client.permission),
	};
  
	// Map actions to dynamic handlers
	const handlers = Object.keys(permissionActions).reduce((acc, key) => {
	  acc[key] = createPermissionHandler(key, permissionActions[key]);
	  return acc;
	}, {} as Record<string, any>);
  
	return {
	  loadings,
	  errors,
	  ...handlers,
	};
  };
  
  export default usePermission;
  
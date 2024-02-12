export { StoryClient } from "./client";
export { ResourceType } from "./enums/ResourceType";
export { ActionType } from "./enums/ActionType";
export { PlatformClient } from "./utils/platform";
export { AddressZero, HashZero } from "./constants/common";

export { IPAssetClient } from "./resources/ipAsset";
export { PermissionClient } from "./resources/permission";
export { LicenseClient } from "./resources/license";
export { PolicyClient } from "./resources/policy";

export type { StoryConfig } from "./types/config";
export type { Hex, TypedData } from "./types/common";

export type {
  RegisterRootIpRequest,
  RegisterRootIpResponse,
  RegisterDerivativeIpRequest,
  RegisterDerivativeIpResponse,
} from "./types/resources/ipAsset";

export type {
  MintLicenseRequest,
  MintLicenseResponse,
  LinkIpToParentRequest,
  LinkIpToParentResponse,
} from "./types/resources/license";

export type {
  RegisterUMLPolicyRequest,
  RegisterUMLPolicyResponse,
  AddPolicyToIpRequest,
  AddPolicyToIpResponse,
} from "./types/resources/policy";

export type { setPermissionsRequest, setPermissionsResponse } from "./types/resources/permission";

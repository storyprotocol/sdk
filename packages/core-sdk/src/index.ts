export { StoryClient } from "./client";
export { AddressZero, HashZero } from "./constants/common";

export { IPAssetClient } from "./resources/ipAsset";
export { PermissionClient } from "./resources/permission";
export { LicenseClient } from "./resources/license";
export { DisputeClient } from "./resources/dispute";

export type { StoryConfig } from "./types/config";
export type { Hex, TypedData } from "./types/common";

export type { RegisterIpResponse, RegisterRequest } from "./types/resources/ipAsset";

export type {
  MintLicenseRequest,
  MintLicenseResponse,
  LinkIpToParentRequest,
  LinkIpToParentResponse,
} from "./types/resources/license";

export type {
  CollectRoyaltyTokensRequest,
  CollectRoyaltyTokensResponse,
  PayRoyaltyOnBehalfRequest,
  PayRoyaltyOnBehalfResponse,
} from "./types/resources/royalty";

export type { SetPermissionsRequest, SetPermissionsResponse } from "./types/resources/permission";

export type {
  Dispute,
  RaiseDisputeRequest,
  RaiseDisputeResponse,
  SetDisputeJudgementRequest,
  SetDisputeJudgementResponse,
  CancelDisputeRequest,
  CancelDisputeResponse,
  ResolveDisputeRequest,
  ResolveDisputeResponse,
} from "./types/resources/dispute";

export type {
  IPAccountExecuteRequest,
  IPAccountExecuteResponse,
  IPAccountExecuteWithSigRequest,
  IPAccountExecuteWithSigResponse,
} from "./types/resources/ipAccount";

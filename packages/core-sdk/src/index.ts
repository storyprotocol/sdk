export { StoryClient } from "./client";
export { AddressZero, HashZero } from "./constants/common";

export { IPAssetClient } from "./resources/ipAsset";
export { PermissionClient } from "./resources/permission";
export { LicenseClient } from "./resources/license";
export { DisputeClient } from "./resources/dispute";

export type { StoryConfig } from "./types/config";
export type { Hex, TypedData } from "./types/common";

export type {
  RegisterIpResponse,
  RegisterRequest,
  RegisterDerivativeResponse,
  RegisterDerivativeRequest,
  RegisterDerivativeWithLicenseTokensRequest,
  RegisterDerivativeWithLicenseTokensResponse,
} from "./types/resources/ipAsset";

export type {
  RegisterNonComSocialRemixingPILRequest,
  RegisterCommercialUsePILRequest,
  RegisterCommercialRemixPILRequest,
  RegisterPILResponse,
  AttachLicenseTermsRequest,
  LicenseTermsIdResponse,
  MintLicenseTokensRequest,
  MintLicenseTokensResponse,
} from "./types/resources/license";

export type {
  CollectRoyaltyTokensRequest,
  CollectRoyaltyTokensResponse,
  PayRoyaltyOnBehalfRequest,
  PayRoyaltyOnBehalfResponse,
  SnapshotRequest,
  SnapshotResponse,
  ClaimableRevenueRequest,
  ClaimableRevenueResponse,
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

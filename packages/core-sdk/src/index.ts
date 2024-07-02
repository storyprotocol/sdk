export { StoryClient } from "./client";
export { AddressZero, HashZero } from "./constants/common";

export { IPAssetClient } from "./resources/ipAsset";
export { PermissionClient } from "./resources/permission";
export { LicenseClient } from "./resources/license";
export { DisputeClient } from "./resources/dispute";
export { NftClient } from "./resources/nftClient";
export { IPAccountClient } from "./resources/ipAccount";
export { RoyaltyClient } from "./resources/royalty";

export type { StoryConfig, SupportedChainIds } from "./types/config";

export type {
  RegisterRequest,
  RegisterIpResponse,
  RegisterDerivativeResponse,
  RegisterDerivativeRequest,
  RegisterDerivativeWithLicenseTokensRequest,
  RegisterDerivativeWithLicenseTokensResponse,
  CreateIpAssetWithPilTermsRequest,
  CreateIpAssetWithPilTermsResponse,
  RegisterIpAndMakeDerivativeRequest,
  RegisterIpAndMakeDerivativeResponse,
  RegisterIpAndAttachPilTermsRequest,
  RegisterIpAndAttachPilTermsResponse,
} from "./types/resources/ipAsset";

export type {
  RegisterNonComSocialRemixingPILRequest,
  RegisterCommercialUsePILRequest,
  RegisterCommercialRemixPILRequest,
  RegisterPILResponse,
  AttachLicenseTermsRequest,
  AttachLicenseTermsResponse,
  MintLicenseTokensRequest,
  MintLicenseTokensResponse,
  LicenseTermsId,
} from "./types/resources/license";
export { PIL_TYPE } from "./types/resources/license";

export type {
  CollectRoyaltyTokensRequest,
  CollectRoyaltyTokensResponse,
  PayRoyaltyOnBehalfRequest,
  PayRoyaltyOnBehalfResponse,
  SnapshotRequest,
  SnapshotResponse,
  ClaimableRevenueRequest,
  ClaimableRevenueResponse,
  ClaimRevenueRequest,
  ClaimRevenueResponse,
} from "./types/resources/royalty";

export type {
  SetPermissionsRequest,
  SetPermissionsResponse,
  CreateSetPermissionSignatureRequest,
  SetAllPermissionsRequest,
  SetBatchPermissionsRequest,
  CreateBatchPermissionSignatureRequest,
} from "./types/resources/permission";
export { AccessPermission } from "./types/resources/permission";
export type {
  RaiseDisputeRequest,
  RaiseDisputeResponse,
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

export type {
  CreateNFTCollectionRequest,
  CreateNFTCollectionResponse,
} from "./types/resources/nftClient";

export type {
  PiLicenseTemplateGetLicenseTermsResponse,
  IpAccountImplStateResponse,
} from "./abi/generated";

export { getPermissionSignature } from "./utils/sign";
export type { PermissionSignatureRequest, PermissionSignatureResponse } from "./types/common";

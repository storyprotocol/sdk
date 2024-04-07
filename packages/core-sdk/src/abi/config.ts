import { getAddress } from "viem";

import IERC1155ABI from "./json/IERC1155.abi";
import AccessControllerABI from "./json/AccessController.abi";
import DisputeModuleABI from "./json/DisputeModule.abi";
import IPAccountImplABI from "./json/IPAccountImpl.abi";
import IPAssetRegistryABI from "./json/IIPAssetRegistry.abi";
import LicensingModuleABI from "./json/LicensingModule.abi";
import PILPolicyFrameworkManagerABI from "./json/PILPolicyFrameworkManager.abi";
import IRoyaltyPolicyLAPABI from "./json/IRoyaltyPolicyLAP.abi";
import IpRoyaltyVaultABI from "./json/IpRoyaltyVault.abi";
import ErrorsABI from "./json/Errors.abi";
import { contractAddress } from "../utils/env";
import { SupportedChainIds } from "../types/config";

export const IPAccountABI = [...IPAccountImplABI, ...ErrorsABI];

export const getIPAssetRegistryConfig = (chain: SupportedChainIds) => ({
  abi: IPAssetRegistryABI,
  address: getAddress(contractAddress[chain].IPAssetRegistry),
});
export const getAccessControllerConfig = (chain: SupportedChainIds) => ({
  abi: [...AccessControllerABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].AccessController),
});
export const getDisputeModuleConfig = (chain: SupportedChainIds) => ({
  abi: [...DisputeModuleABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].DisputeModule),
});
export const getLicenseRegistryConfig = (chain: SupportedChainIds) => ({
  abi: IERC1155ABI,
  address: getAddress(contractAddress[chain].LicenseRegistry),
});
export const getLicensingModuleConfig = (chain: SupportedChainIds) => ({
  abi: [...LicensingModuleABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].LicensingModule),
});

export const getPILPolicyFrameworkManagerConfig = (chain: SupportedChainIds) => ({
  abi: [...PILPolicyFrameworkManagerABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].PILPolicyFrameworkManager),
});
export const getRoyaltyPolicyLAPConfig = (chain: SupportedChainIds) => ({
  abi: [...IRoyaltyPolicyLAPABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].RoyaltyPolicyLAP),
});

export const getRoyaltyVaultImplConfig = (chain: SupportedChainIds) => ({
  abi: [...IpRoyaltyVaultABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].IpRoyaltyVaultImpl),
});

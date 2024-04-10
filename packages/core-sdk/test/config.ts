import { getAddress } from "viem";

import IERC1155ABI from "../src/abi/json/IERC1155.abi";
import AccessControllerABI from "../src/abi/json/AccessController.abi";
import DisputeModuleABI from "../src/abi/json/DisputeModule.abi";
import IPAccountImplABI from "../src/abi/json/IPAccountImpl.abi";
import IPAssetRegistryABI from "../src/abi/json/IIPAssetRegistry.abi";
import LicensingModuleABI from "../src/abi/json/LicensingModule.abi";
import IRoyaltyPolicyLAPABI from "../src/abi/json/IRoyaltyPolicyLAP.abi";
import IpRoyaltyVaultABI from "../src/abi/json/IpRoyaltyVault.abi";
import IRoyaltyModuleABI from "../src/abi/json/IRoyaltyModule.abi";
import PILicenseTemplateABI from "../src/abi/json/IPILicenseTemplate.abi";
import ErrorsABI from "../src/abi/json/Errors.abi";
import { contractAddress } from "./env";
import { SupportedChainIds } from "../src/types/config";

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
export const getPILicenseTemplateConfig = (chain: SupportedChainIds) => ({
  abi: [...PILicenseTemplateABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].PILicenseTemplate),
});
export const getRoyaltyPolicyLAPConfig = (chain: SupportedChainIds) => ({
  abi: [...IRoyaltyPolicyLAPABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].RoyaltyPolicyLAP),
});

export const getRoyaltyVaultImplConfig = (chain: SupportedChainIds) => ({
  abi: [...IpRoyaltyVaultABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].IpRoyaltyVaultImpl),
});

export const getRoyaltyModuleConfig = (chain: SupportedChainIds) => ({
  abi: [...IRoyaltyModuleABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].RoyaltyModule),
});

export const getLicenseTemplateConfig = (chain: SupportedChainIds) => ({
  abi: [...PILicenseTemplateABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].PILicenseTemplate),
});

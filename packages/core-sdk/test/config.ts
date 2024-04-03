import { getAddress } from "viem";

import IERC1155ABI from "../src/abi/json/IERC1155.abi";
import AccessControllerABI from "../src/abi/json/AccessController.abi";
import DisputeModuleABI from "../src/abi/json/DisputeModule.abi";
import IPAccountImplABI from "../src/abi/json/IPAccountImpl.abi";
import IPAssetRegistryABI from "../src/abi/json/IIPAssetRegistry.abi";
import LicensingModuleABI from "../src/abi/json/LicensingModule.abi";
import IpRoyaltyModuleABI from "../src/abi/json/RoyaltyModule.abi";
import PILPolicyFrameworkManagerABI from "../src/abi/json/PILPolicyFrameworkManager.abi";
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
export const getPILPolicyFrameworkManagerConfig = (chain: SupportedChainIds) => ({
  abi: [...PILPolicyFrameworkManagerABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].PILPolicyFrameworkManager),
});
export const getRoyaltyPolicyLAPConfig = (chain: SupportedChainIds) => ({
  address: getAddress(contractAddress[chain].RoyaltyPolicyLAP),
});
export const getRoyaltyModuleConfig = (chain: SupportedChainIds) => ({
  abi: [...IpRoyaltyModuleABI, ...ErrorsABI],
  address: getAddress(contractAddress[chain].RoyaltyModule),
});

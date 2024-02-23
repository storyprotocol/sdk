import { getAddress } from "viem";

import IERC1155ABI from "./json/IERC1155.abi";
import AccessControllerABI from "./json/AccessController.abi";
import DisputeModuleABI from "./json/DisputeModule.abi";
import IPAccountImplABI from "./json/IPAccountImpl.abi";
import IPAssetRegistryABI from "./json/IIPAssetRegistry.abi";
import LicensingModuleABI from "./json/LicensingModule.abi";
import PILPolicyFrameworkManagerABI from "./json/PILPolicyFrameworkManager.abi";
import RegistrationModuleABI from "./json/RegistrationModule.abi";
import ErrorsABI from "./json/Errors.abi";
import { sepolia } from "../utils/env";

export const IPAccountABI = [...IPAccountImplABI, ...ErrorsABI];

export const IPAssetRegistryConfig = {
  abi: IPAssetRegistryABI,
  address: getAddress(sepolia.IPAssetRegistry),
};

export const AccessControllerConfig = {
  abi: [...AccessControllerABI, ...ErrorsABI],
  address: getAddress(sepolia.AccessController),
};

export const DisputeModuleConfig = {
  abi: [...DisputeModuleABI, ...ErrorsABI],
  address: getAddress(sepolia.DisputeModule),
};

export const LicenseRegistryConfig = {
  abi: IERC1155ABI,
  address: getAddress(sepolia.LicenseRegistry),
};

export const LicensingModuleConfig = {
  abi: LicensingModuleABI,
  //abi: [...LicensingModuleABI, ...ErrorsABI],
  address: getAddress(sepolia.LicensingModule),
};

export const RegistrationModuleConfig = {
  abi: [...RegistrationModuleABI, ...ErrorsABI],
  address: getAddress(sepolia.RegistrationModule),
};

export const PILPolicyFrameworkManagerConfig = {
  abi: [...PILPolicyFrameworkManagerABI, ...ErrorsABI],
  address: getAddress(sepolia.PILPolicyFrameworkManager),
};

export const RoyaltyPolicyLAPConfig = {
  address: getAddress(sepolia.RoyaltyPolicyLAP),
};

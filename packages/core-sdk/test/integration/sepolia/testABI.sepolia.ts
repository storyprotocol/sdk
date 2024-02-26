import { getAddress } from "viem";

import IERC1155ABI from "../../../src/abi/json/IERC1155.abi";
import AccessControllerABI from "../../../src/abi/json/AccessController.abi";
import DisputeModuleABI from "../../../src/abi/json/DisputeModule.abi";
import IPAccountImplABI from "../../../src/abi/json/IPAccountImpl.abi";
import IPAssetRegistryABI from "../../../src/abi/json/IIPAssetRegistry.abi";
import LicensingModuleABI from "../../../src/abi/json/LicensingModule.abi";
import PILPolicyFrameworkManagerABI from "../../../src/abi/json/PILPolicyFrameworkManager.abi";
import RegistrationModuleABI from "../../../src/abi/json/RegistrationModule.abi";
import ErrorsABI from "../../../src/abi/json/Errors.abi";
import { sepolia } from "../../../src/utils/env";

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
  abi: [...LicensingModuleABI, ...ErrorsABI],
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

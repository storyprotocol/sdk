import { getAddress } from "viem";

import IERC1155ABI from "../../../../src/abi/json/IERC1155.abi";
import AccessControllerABI from "../../../../src/abi/json/AccessController.abi";
import DisputeModuleABI from "../../../../src/abi/json/DisputeModule.abi";
import IPAccountImplABI from "../../../../src/abi/json/IPAccountImpl.abi";
import IPAssetRegistryABI from "../../../../src/abi/json/IIPAssetRegistry.abi";
import LicensingModuleABI from "../../../../src/abi/json/LicensingModule.abi";
import PILPolicyFrameworkManagerABI from "../../../../src/abi/json/PILPolicyFrameworkManager.abi";
import ErrorsABI from "../../../../src/abi/json/Errors.abi";
import renaissance from "./renaissance.env";
export const IPAccountABI = [...IPAccountImplABI, ...ErrorsABI];

export const IPAssetRegistryConfig = {
  abi: IPAssetRegistryABI,
  address: getAddress(renaissance.IPAssetRegistry),
};

export const AccessControllerConfig = {
  abi: [...AccessControllerABI, ...ErrorsABI],
  address: getAddress(renaissance.AccessController),
};

export const DisputeModuleConfig = {
  abi: [...DisputeModuleABI, ...ErrorsABI],
  address: getAddress(renaissance.DisputeModule),
};

export const LicenseRegistryConfig = {
  abi: IERC1155ABI,
  address: getAddress(renaissance.LicenseRegistry),
};

export const LicensingModuleConfig = {
  abi: [...LicensingModuleABI, ...ErrorsABI],
  address: getAddress(renaissance.LicensingModule),
};

export const PILPolicyFrameworkManagerConfig = {
  abi: [...PILPolicyFrameworkManagerABI, ...ErrorsABI],
  address: getAddress(renaissance.PILPolicyFrameworkManager),
};

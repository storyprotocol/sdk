import { getAddress } from "viem";

import IERC1155ABI from "../../src/abi/json/IERC1155.abi";
import AccessControllerABI from "../../src/abi/json/AccessController.abi";
import DisputeModuleABI from "../../src/abi/json/DisputeModule.abi";
import IPAccountImplABI from "../../src/abi/json/IPAccountImpl.abi";
import IPAssetRegistryABI from "../../src/abi/json/IIPAssetRegistry.abi";
import LicensingModuleABI from "../../src/abi/json/LicensingModule.abi";
import PILPolicyFrameworkManagerABI from "../../src/abi/json/PILPolicyFrameworkManager.abi";
import RegistrationModuleABI from "../../src/abi/json/RegistrationModule.abi";
import TaggingModuleABI from "../../src/abi/json/TaggingModule.abi";
import ErrorsABI from "../../src/abi/json/Errors.abi";
import { tenderly } from "../../src/utils/env";

export const IPAccountABI = [...IPAccountImplABI, ...ErrorsABI];

export const IPAssetRegistryConfig = {
  abi: IPAssetRegistryABI,
  address: getAddress(tenderly.IPAssetRegistry),
};

export const AccessControllerConfig = {
  abi: [...AccessControllerABI, ...ErrorsABI],
  address: getAddress(tenderly.AccessController),
};

export const DisputeModuleConfig = {
  abi: [...DisputeModuleABI, ...ErrorsABI],
  address: getAddress(tenderly.DisputeModule),
};

export const LicenseRegistryConfig = {
  abi: IERC1155ABI,
  address: getAddress(tenderly.LicenseRegistry),
};

export const LicensingModuleConfig = {
  abi: LicensingModuleABI,
  //abi: [...LicensingModuleABI, ...ErrorsABI],
  address: getAddress(tenderly.LicensingModule),
};

export const RegistrationModuleConfig = {
  abi: RegistrationModuleABI,
  //abi: [...RegistrationModuleABI, ...ErrorsABI],
  address: getAddress(tenderly.RegistrationModule),
};

export const TaggingModuleConfig = {
  abi: [...TaggingModuleABI, ...ErrorsABI],
  address: getAddress(tenderly.TaggingModule),
};

export const PILPolicyFrameworkManagerConfig = {
  abi: PILPolicyFrameworkManagerABI,
  //abi: [...PILPolicyFrameworkManagerABI, ...ErrorsABI],
  address: getAddress(tenderly.PILPolicyFrameworkManager),
};

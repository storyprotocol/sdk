import { getAddress } from "viem";
import * as dotenv from "dotenv";

import AccessControllerABI from "./json/AccessController.abi";
import DisputeModuleABI from "./json/DisputeModule.abi";
import IPAccountImplABI from "./json/IPAccountImpl.abi";
import IPAssetRegistryABI from "./json/IIPAssetRegistry.abi";
import LicenseRegistryABI from "./json/LicenseRegistry.abi";
import LicensingModuleABI from "./json/LicensingModule.abi";
import UMLPolicyFrameworkManagerABI from "./json/UMLPolicyFrameworkManager.abi";
import RegistrationModuleABI from "./json/RegistrationModule.abi";
import TaggingModuleABI from "./json/TaggingModule.abi";
import ErrorsABI from "./json/Errors.abi";

if (typeof process !== "undefined") {
  dotenv.config();
}

export const IPAccountABI = [...IPAccountImplABI, ...ErrorsABI];

export const IPAssetRegistryConfig = {
  abi: IPAssetRegistryABI,
  address: getAddress(
    process.env.IP_ASSET_REGISTRY || process.env.NEXT_PUBLIC_IP_ASSET_REGISTRY || "",
  ),
};

export const AccessControllerConfig = {
  abi: AccessControllerABI,
  address: getAddress(
    process.env.ACCESS_CONTROLLER || process.env.NEXT_PUBLIC_ACCESS_CONTROLLER || "",
  ),
};

export const DisputeModuleConfig = {
  abi: [...DisputeModuleABI, ...ErrorsABI],
  address: getAddress(process.env.DISPUTE_MODULE || process.env.NEXT_PUBLIC_DISPUTE_MODULE || ""),
};

export const LicenseRegistryConfig = {
  abi: LicenseRegistryABI,
  address: getAddress(
    process.env.LICENSE_REGISTRY || process.env.NEXT_PUBLIC_LICENSE_REGISTRY || "",
  ),
};

export const LicensingModuleConfig = {
  abi: LicensingModuleABI,
  address: getAddress(
    process.env.LICENSING_MODULE || process.env.NEXT_PUBLIC_LICENSING_MODULE || "",
  ),
};

export const RegistrationModuleConfig = {
  abi: RegistrationModuleABI,
  address: getAddress(
    process.env.REGISTRATION_MODULE || process.env.NEXT_PUBLIC_REGISTRATION_MODULE || "",
  ),
};

export const TaggingModuleConfig = {
  abi: [...TaggingModuleABI, ...ErrorsABI],
  address: getAddress(process.env.TAGGING_MODULE || process.env.NEXT_PUBLIC_TAGGING_MODULE || ""),
};

export const UMLPolicyFrameworkManagerConfig = {
  abi: UMLPolicyFrameworkManagerABI,
  address: getAddress(
    process.env.UML_POLICY_FRAMEWORK_MANAGER ||
      process.env.NEXT_PUBLIC_UML_POLICY_FRAMEWORK_MANAGER ||
      "",
  ),
};

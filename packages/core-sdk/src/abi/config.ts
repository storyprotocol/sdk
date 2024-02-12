import { getAddress } from "viem";
import * as dotenv from "dotenv";

import IERC1155ABI from "./json/IERC1155.abi";
import AccessControllerABI from "./json/AccessController.abi";
import DisputeModuleABI from "./json/DisputeModule.abi";
import IPAccountImplABI from "./json/IPAccountImpl.abi";
import IPAssetRegistryABI from "./json/IIPAssetRegistry.abi";
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
  address: getAddress("0xF2c66aAd2287F3fa00C3461862612Eaf1FAAEcDb"),
};

export const AccessControllerConfig = {
  abi: [...AccessControllerABI, ...ErrorsABI],
  address: getAddress("0x069AD174fb6285086b692AC9a6f328DCBcB94FC3"),
};

export const DisputeModuleConfig = {
  abi: [...DisputeModuleABI, ...ErrorsABI],
  address: getAddress("0x0B935d36516267fc2B4c902449b7D5Cfc2d5102A"),
};

export const LicenseRegistryConfig = {
  abi: IERC1155ABI,
  address: getAddress("0x051A0441918d7c393ba796dc6754c476324dAdEC"),
};

export const LicensingModuleConfig = {
  abi: [...LicensingModuleABI, ...ErrorsABI],
  address: getAddress("0x911415eb87b732443e8FbAd8aC8890Bf73BAa8Ec"),
};

export const RegistrationModuleConfig = {
  abi: [...RegistrationModuleABI, ...ErrorsABI],
  address: getAddress("0x1Ad58168Ae7914C3e8aA8c6F5068CFb23490F27F"),
};

export const TaggingModuleConfig = {
  abi: [...TaggingModuleABI, ...ErrorsABI],
  address: getAddress("0x333BECf0FF68C02E4387005A89c30De885b8a38F"),
};

export const UMLPolicyFrameworkManagerConfig = {
  abi: [...UMLPolicyFrameworkManagerABI, ...ErrorsABI],
  address: getAddress("0xae4De58808EB503E9C460C7A852c67C3152D5385"),
};

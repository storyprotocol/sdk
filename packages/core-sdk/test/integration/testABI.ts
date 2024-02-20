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
// mocks
import MockERC20ABI from "../mock/abi/MockERC20.abi";
import MockERC721ABI from "../mock/abi/MockERC721.abi";
import MockTokenGatedHookABI from "../mock/abi/MockTokenGatedHook.abi";

export const tenderly = {
  AccessController: "0xE2a7fBFA8c5920B938E44b6f8cf1a27B39b8690A",
  AncestorsVaultLAP: "0xD13834D9139A35e0532B784355322D5845b5CcdE",
  ArbitrationPolicySP: "0x79A88f4C29B5aAa6E664073fCac592be81901e73",
  DisputeModule: "0xDc60470b1CaA7b3FF6e6FFa6A111109a50003D6C",
  Governance: "0x6aA0aC1d5704b3afe6D89F01941b2E9ef36642ec",
  IPAccountImpl: "0xd35fC98E263D32E008e21af635E6b74Fac5c2846",
  IPAccountRegistry: "0x309F1418410ddD6F929857a7E000094b3a541c49",
  IPAssetRegistry: "0x85A242583aed6AEed3840b3baB71D4eE17938C97",
  IPAssetRenderer: "0xC6421914b3C765Efd95bA724b66C8f1615AF0ccD",
  IPMetadataProvider: "0x52786D7F6575F9b505d565b41c4B8D535F20B991",
  IPResolver: "0x766Fa852E75CB74B7C112b7862601aDcDF2b0f67",
  LicenseRegistry: "0xAF8e5449261918cB70D1F5A80631889113378Da9",
  LicensingModule: "0x41DBc4Ab0Fb769D739D5A5f82afD864f23a46e3f",
  MockERC20: "0x6eDC1f303417d5d499c315D101cC9CA3ebA4568B",
  MockERC721: "0xC149b230Fd32Eb3457fB63b263F24e8C4dde61E9",
  MockTokenGatedHook: "0x46aFd5fe6Dda25400F8391C76DcA031D45e98656",
  ModuleRegistry: "0xf0aB9A76B4cf82120fecC7A39132d5d25EDC9F14",
  PILPolicyFrameworkManager: "0x10140919663ff04a0021F83087dBD469f01ccbb4",
  RegistrationModule: "0xB4c21B087F01005208f96Ed7c3Ae5A6bFe4FDFA6",
  RoyaltyModule: "0x63f170BF8A46b607960af1CF695a5283104Ec312",
  RoyaltyPolicyLAP: "0xbfC7fE09Df1ECB47d53114f1024ea0A6D00f071D",
  TaggingModule: "0xFCB0D626e6469C726fbB0274CCafb004C703f001",
};

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

export const MockERC20Config = {
  abi: MockERC20ABI,
  address: getAddress(tenderly.MockERC20),
};

export const MockERC721Config = {
  abi: MockERC721ABI,
  address: getAddress(tenderly.MockERC721),
};

export const MockTokenGatedHookConfig = {
  abi: MockTokenGatedHookABI,
  address: getAddress(tenderly.MockTokenGatedHook),
};

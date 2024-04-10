import { Hex } from "viem";
import { ContractAddress } from "../src/types/config";

const sepolia: Record<string, Hex> = {
  AccessController: "0x674d6E1f7b5e2d714DBa588e9d046965225517c8",
  ArbitrationPolicySP: "0xb41BC78478878B338336C5E7a34292213779cd6F",
  DisputeModule: "0x3A96cad7b2aC783a6811c7c3e8DEF30E8a4cfcDb",
  IPAccountImpl: "0x7481a227A11860E80f69AB39d0165258f4c139f6",
  IPAccountRegistry: "0x74Cbd8CCc22290FeaaE8421D4FFc6760210B5B0C",
  IPAssetRegistry: "0xb1534826Bc9D77d818CbC596435f530778C73865",
  LicenseRegistry: "0x66f6865668F2B9213Ed05b97eE97beb97A75e243",
  LicensingModule: "0x2ac240293f12032E103458451dE8A8096c5A72E8",
  PILicenseTemplate: "0xd0Be223ae9719bBD93447ecf5289319CCf8cA227",
  RegistrationModule: "0x193f0Cc84d51Fc38a30658d7eFffEB2C5Cc25840",
  RoyaltyPolicyLAP: "0xb811a9aD59375eDC449cb3A05eB4672042BB9Daf",
};

export const storyTestnetAddress: Record<string, Hex> = {
  AccessController: "0x7e253Df9b0fC872746877Fa362b2cAf32712d770",
  ArbitrationPolicySP: "0xA25bc70932282b35407e0DC08cc9C91f6b00CEf0",
  CoreMetadataModule: "0x8A8FBAaEB6A0B7736ebde31c6F49CccD808232bA",
  CoreMetadataViewModule: "0x8A8FBAaEB6A0B7736ebde31c6F49CccD808232bA",
  DisputeModule: "0x6d54456Ae5DCbDC0C9E2713cC8E650fE4f445c7C",
  Governance: "0x63F4A670A8b518ef5eb291559BdAbea4b31c1AC4",
  IPAccountImpl: "0x38cAfD16502B1d61c6399A18d6Fa1Ea8CEca3678",
  IPAccountRegistry: "0x8448d0F77D7e67e0814f83D988aB3344D46bb1E4",
  IPAssetRegistry: "0x862de97662a1231FFc14038eC1BE93aB129D2169",
  IpRoyaltyVaultBeacon: "0xE92Cdf428f07D92248b6b15ce59a9d5597428F21",
  IpRoyaltyVaultImpl: "0x8Be22cc2D13ADF496a417D9C616dA4a253c68Af8",
  LicenseRegistry: "0x0c3D467537FAd845a78728CEdc3D9447338c5422",
  LicenseToken: "0xD40b7bCA204f96a346021e31c9ad54FF495226e7",
  LicensingModule: "0xEeDDE5529122b621105798860F235c28FD3aBA40",
  MockERC20: "0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAE",
  MockERC721: "0x83DD606d14CcEb629dE9Bf8Aad7aE63767dB476f",
  MockTokenGatedHook: "0x80519d82FBE474AB9E863A066AC32E3eeAFc8F11",
  ModuleRegistry: "0xf2965E3B6251905Dd1E8671077760D07b0408cf2",
  PILicenseTemplate: "0xd0Be223ae9719bBD93447ecf5289319CCf8cA227",
  RoyaltyModule: "0x551AD8CD7893003cE00500aC2aCF1E327763D9f6",
  RoyaltyPolicyLAP: "0x2EcdB5bD12a037dCb9De0Ab7957f35FEeF758eA6",
  TokenWithdrawalModule: "0xC573E5c36B8FA5108b78f7357947972D030699d5",
};

export const contractAddress: ContractAddress = {
  sepolia,
  11155111: sepolia,
  storyTestnet: storyTestnetAddress,
  1513: storyTestnetAddress,
};

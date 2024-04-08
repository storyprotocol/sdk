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
  PILPolicyFrameworkManager: "0x3C30b98f56b469c0d292EFF5878e9Fb302CB13dD",
  RegistrationModule: "0x193f0Cc84d51Fc38a30658d7eFffEB2C5Cc25840",
  RoyaltyPolicyLAP: "0xb811a9aD59375eDC449cb3A05eB4672042BB9Daf",
};

export const storyTestnetAddress: Record<string, Hex> = {
  AccessController: "0x6fB5BA9A8747E897109044a1cd1192898AA384a9",
  ArbitrationPolicySP: "0x114aE96d362b802Ed92758A21992e429e9E83565",
  DisputeModule: "0x837d095F9A11178545DF4114C44fb526dcf74168",
  Governance: "0x0Fee5B61cF0976f3F59138146a9180a107738db9",
  IPAccountImpl: "0x6d1398e1ceE174a3e41d6eB50F00Fe43132f9C8A",
  IPAccountRegistry: "0x0CCc0CD388477ED0D7531d2aD6e68c9E24B8392d",
  IPAssetRegistry: "0x30C89bCB41277f09b18DF0375b9438909e193bf0",
  IpRoyaltyVaultBeacon: "0x8C7664Befc382A282F8aA821A2d337960e410E77",
  IpRoyaltyVaultImpl: "0x0dB6AAb7525F03Bf94A1fC08A9aACCc2Ad25eD12",
  LicenseRegistry: "0x790717fBa06Aa219Fc3A502ce360d8dEAF273Eb5",
  LicensingModule: "0xB7a83a5f3C8b512A6DfE294ad4811F1b4AA10E96",
  MockERC20: "0xCc97e835157daf88820cbDE105ADFF5d7981A382",
  MockERC721: "0x7c0004C6D352bC0a0531AaD46d33A03D9d51ab1D",
  MockTokenGatedHook: "0xD3Aa4F5B77509907FF3d7a90cEadE19bab2b6Fdb",
  ModuleRegistry: "0xab0bf9846eCE1299AaA1cB3FF5EfbBA328968771",
  PILPolicyFrameworkManager: "0x251bce81DF5957123869E43269C4E29308A062c4",
  RoyaltyModule: "0xF77b0933F6aaC2dCE2eAa0d79f6Bfd6b9347a5E7",
  RoyaltyPolicyLAP: "0x31f263D48df5FA5956E2Ba614b150e2A0fE1aDd3",
  TokenWithdrawalModule: "0x446B734C3Fc13c53b4E32FEFCaaED97e0100552D",
};

export const contractAddress: ContractAddress = {
  sepolia,
  11155111: sepolia,
  storyTestnet: storyTestnetAddress,
  1513: storyTestnetAddress,
};

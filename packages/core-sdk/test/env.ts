import { ContractAddress } from "../src/types/config";

const sepolia = {
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

export const renaissanceAddress = {
  AccessController: "0x92c87ae0a0a4b8629ad028e55183CC2b7eC057D3",
  AncestorsVaultLAP: "0x280f8921E36d6Af2E03AD84EC8194ad1b6B4799c",
  ArbitrationPolicySP: "0xCc3dDa466A18C4F20Bc0750756B92E2f23741Fd3",
  DisputeModule: "0x0Ac6fdA124b05D2daA5E9De7059c866EE1CE7Bcb",
  Governance: "0x6D8070F7726769bEd136bc7007B3deA695f7047A",
  IPAccountImpl: "0xddcBD4309f0545fa8cC99137bC621620e017bdBe",
  IPAccountRegistry: "0x16129393444e5BEb435501Dea41D5ECfB10b76F0",
  IPAssetRegistry: "0xAAe9e83F8cE8832270AF033c609e233686f0E0eB",
  IPAssetRenderer: "0x39cCE13916e7bfdeFa462D360d551aEcc6D82311",
  IPMetadataProvider: "0x0A97aD19FEF318F0ACA888574b64A35402C8aDDB",
  IPResolver: "0xeAEd88BEbF00acac8EFE9ED426cDDD2Dc9f8CB78",
  LicensingModule: "0x2A88056985814dcBb72aFA50B95893359B6262f5",
  MockERC20: "0x3271778AdE44EfeC9e11b7160827921b6d614AF1",
  MockERC721: "0x9B3c8947250cec49a49de939031Ea547521Df247",
  MockTokenGatedHook: "0x008B5D8Db85100E143729453784e9F077B2279fA",
  ModuleRegistry: "0xB8617E2FC9dbFd51781B8D281b725976E3B43f9d",
  PILPolicyFrameworkManager: "0xAc2C50Af31501370366D243FaeC56F89128f6d96",
  RegistrationModule: "0xa6249720b3BD1179d84b7E74029Ed2F78E5eC694",
  RoyaltyModule: "0xE1a667ccc38540b38d8579c499bE22e51390a308",
  RoyaltyPolicyLAP: "0x265C21b34e0E92d63C678425478C42aa8D727B79",
  TokenWithdrawalModule: "0x5f62d238B3022bA5881e5e443B014cac6999a4f2",
  SplitMain: "0x700f20dA87274a3b90D432B77F393544aeE351eC",
  SplitWallet: "0x7D9a009A09f52307FD26F2380A1952097629408b",
  LiquidSplitFactory: "0x0efCDB5D06266654F5e6485d466F56d70Cb5B6c0",
  LS1155CloneImpl: "0xA75c519c7b7fB5acc8C02C06d3a2DF3519E479FC",
  LicenseRegistry: "0x410d2332270cEb9Ca78b7E2c3720046b3ef2D8Ba",
};

const mainnet = {};
const mumbai = {};
const polygonMumbai = {};

export const contractAddress: ContractAddress = {
  sepolia,
  11155111: sepolia,
  renaissance: renaissanceAddress,
  1513: renaissanceAddress,
  mainnet,
  1: mainnet,
  80001: mumbai,
  mumbai,
  polygonMumbai,
};
import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import * as dotenv from "dotenv";
import { Abi } from "abitype";
import { pascalCase } from "change-case";

import { abi as ipAccountRegistryAbi } from "../protocol-core/out/IIPAccountRegistry.sol/IIPAccountRegistry.json";
import { abi as registrationModuleAbi } from "../protocol-core/out/RegistrationModule.sol/RegistrationModule.json";
import { abi as disputeModuleAbi } from "../protocol-core/out/DisputeModule.sol/DisputeModule.json";
import { abi as ipAssetRegistryAbi } from "../protocol-core/out/IPAssetRegistry.sol/IPAssetRegistry.json";
import { abi as licenseRegistryAbi } from "../protocol-core/out/LicenseRegistry.sol/LicenseRegistry.json";
import { abi as moduleRegistryAbi } from "../protocol-core/out/ModuleRegistry.sol/ModuleRegistry.json";
import { abi as licensingModuleAbi } from "../protocol-core/out/LicensingModule.sol/LicensingModule.json";
import { abi as accessControllerAbi } from "../protocol-core/out/AccessController.sol/AccessController.json";
import { abi as ipAccountImplAbi } from "../protocol-core/out/IPAccountImpl.sol/IPAccountImpl.json";
import { abi as UMLPolicyFrameworkManagerAbi } from "../protocol-core/out/UMLPolicyFrameworkManager.sol/UMLPolicyFrameworkManager.json";

dotenv.config();

const contracts = {
  AccessController: "0xfeDc2A52AA77977E291d9077C7AbB60be76399FC",
  ArbitrationPolicySP: "0x7EcF3E32C61511fbfeC5bcA9040bD1b253C0d1fe",
  DisputeModule: "0xfE1Af9c0F78Df4570Ed54A1bc21487AB88923dc6",
  Governance: "0xA8A4DA2991BC4D17D1F95eA5B2ef9661187F2002",
  IPAccountImpl: "0x0421369bC566A9f64edDcF8e8339564e1aB1a0f3",
  IPAccountRegistry: "0x6F86118e938a5727f1f0914da4320c7D856Fd997",
  IPAssetRegistry: "0xef1d6eD8c51c63d3918ccb8377c62C039d27f9b2",
  IPAssetRenderer: "0x1ba70C07368131a644b8Be1d47d78CDdCb52cAdb",
  IPMetadataProvider: "0xf71BaDfb93e94fCb8E3046D9dB07d43D2CF0b084",
  IPResolver: "0x9A937de5C2960b269057E4BF94B37280E41A5910",
  LicenseRegistry: "0x6F7FB37F668ba0F85b6a9C7Ffa02fEA1b3036aEF",
  LicensingModule: "0xFA83236c5Ed58E0943652Ad075940517420498Ad",
  MetadataProviderV1: "0xf71BaDfb93e94fCb8E3046D9dB07d43D2CF0b084",
  MockERC20: "0x020D1075E73b555F4EbC059b8641DB53FE721c45",
  MockERC721: "0xbfBb6753596C0937a939421de87987E4df7CF3E4",
  ModuleRegistry: "0x1DA8Ae6f360bBD44b3f148B1274Dc3bf1af829a5",
  RegistrationModule: "0x27c899af5AD9024570B9e5c58831726b48430212",
  RoyaltyModule: "0x3290C74e287394E9a41329Da3Df6d7174f05b81b",
  RoyaltyPolicyLS: "0xD781f120C8c3d95d9bf6230898096Dc59fEcB21b",
  TaggingModule: "0x5c2Ce76e3BB99a05F797177E15D6E2abA101aCD1",
  UMLPolicyFrameworkManager: "0x30A18EA9abca9ff72fB9ce33F4f060A44a09f515",
};

let counter = 0;

function generateConfig(
  generatedName: string,
  contractName: string,
  abi: Abi,
  address?: `0x${string}`,
) {
  return {
    out: `src/generated/${generatedName}.ts`,
    contracts: [
      {
        name: contractName,
        abi: abi,
        address: address,
      },
    ],
    plugins: [
      react({
        getHookName: ({ contractName, itemName, type }) => {
          let functionName;
          if (
            itemName === "LicenseRegistry" ||
            (itemName === "LicensingModule" &&
              contractName.toLowerCase() === "umlpolicyframeworkmanager")
          ) {
            // Handle duplicate function names
            counter = counter + 1;
            functionName =
              `use${pascalCase(type)}${contractName}${itemName ? itemName : ""}` +
              counter.toString();
          } else {
            functionName = `use${pascalCase(type)}${pascalCase(contractName)}${pascalCase(
              itemName ? itemName : "",
            )}`;
          }
          return functionName;
        },
      }),
    ],
  };
}

const ipAssetRegistryConfig = generateConfig(
  "ipAssetRegistry",
  "IpAssetRegistry",
  ipAssetRegistryAbi as Abi,
  contracts.IPAssetRegistry as `0x${string}`,
);

const licenseRegistryConfig = generateConfig(
  "licenseRegistry",
  "LicenseRegistry",
  licenseRegistryAbi as Abi,
  contracts.LicenseRegistry as `0x${string}`,
);

const licensingModuleConfig = generateConfig(
  "licensingModule",
  "LicensingModule",
  licensingModuleAbi as Abi,
  contracts.LicenseRegistry as `0x${string}`,
);

const accessControllerConfig = generateConfig(
  "accessController",
  "AccessController",
  accessControllerAbi as Abi,
  contracts.AccessController as `0x${string}`,
);

const registrationModuleConfig = generateConfig(
  "registrationModule",
  "RegistrationModule",
  registrationModuleAbi as Abi,
  contracts.RegistrationModule as `0x${string}`,
);

const ipAccountImplConfig = generateConfig(
  "ipAccountImpl",
  "IPAccountImpl",
  ipAccountImplAbi as Abi,
);

const disputeModuleConfig = generateConfig(
  "disputeModule",
  "DisputeModule",
  disputeModuleAbi as Abi,
  contracts.DisputeModule as `0x${string}`,
);

const UMLPolicyFrameworkManager = generateConfig(
  "UMLPolicyFrameworkManager",
  "UMLPolicyFrameworkManager",
  UMLPolicyFrameworkManagerAbi as Abi,
  contracts.UMLPolicyFrameworkManager as `0x${string}`,
);

export default defineConfig([
  ipAssetRegistryConfig,
  licenseRegistryConfig,
  registrationModuleConfig,
  accessControllerConfig,
  licensingModuleConfig,
  ipAccountImplConfig,
  disputeModuleConfig,
  UMLPolicyFrameworkManager,
]);

// export default defineConfig({
//   out: "lib/generated.ts",
//   plugins: [
//     foundry({
//       project: "../protocol-core",
//       exclude: ["../protocol-core/lib/reference/src/interfaces/**"],
//     }),
//     actions({
//       getActionName({ contractName, type }) {
//         return `${contractName}__${type}`;
//       },
//     }),
//   ],
// });

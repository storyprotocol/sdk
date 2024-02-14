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

dotenv.config();

const contracts = {
  AccessController: "0x263f0634E64A191884cc778E58f505F758b295E0",
  ArbitrationPolicySP: "0x61eb3DBc2c60Cf6aFde43a9286D89Da264899003",
  DisputeModule: "0x77160D22148C7468b472992ad51532c3d8af9264",
  Governance: "0xc0F5bBc6D8853BC66a7a323aEC993c6AB5f23c90",
  IPAccountImpl: "0x7c0Add64ed6A604E65979c3fc5836Fc4CBD30D04",
  IPAccountRegistry: "0xAA12037BFc9117143e9476446FFE5a0a729a9aE1",
  IPAssetRegistry: "0x7567ea73697De50591EEc317Fe2b924252c41608",
  IPAssetRenderer: "0x92B4A6e131dBa650099300A5Bd73eFd7e1F1D186",
  IPResolver: "0xEF808885355B3c88648D39c9DB5A0c08D99C6B71",
  LicenseRegistry: "0xF157fe3F5Bc001176FB86f486d11EE28F85979d9",
  LicensingModule: "0xC7FB0655bf248633235B79c961Ee033b34146BB2",
  MetadataProviderV1: "0x2F11b29C0fC7BbaF40Be6c6B2c0Bb4cADB93328d",
  MockERC20: "0x3C01C78e603f9294f45f4704cA75d69aF7C1972B",
  MockERC721: "0x1e47f9cafBc2262Fb8aD1Bb6836244Dd6b9a07d2",
  ModuleRegistry: "0xA32408A1d408Aa7cC88471Cc4912c029f67f0087",
  RegistrationModule: "0x10966FF701d4c3c22c0D0360F0d11dA99144F199",
  RoyaltyModule: "0x3D3c75C48A56B1F12e9cE514443749764e0D4811",
  RoyaltyPolicyLS: "0x03C176B480a04E744d293D0530b2441d5F042832",
  TaggingModule: "0x7e4f6B54Ecd6B6D1dBfA1d56593a71f77A80d37C",
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
        address: address
          ? {
              11155111: address, // Only support Sepolia for now
            }
          : undefined,
      },
    ],
    plugins: [
      react({
        getHookName: ({ contractName, itemName, type }) => {
          let functionName;

          if (itemName === "LicenseRegistry") {
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

export default defineConfig([
  ipAssetRegistryConfig,
  licenseRegistryConfig,
  registrationModuleConfig,
  accessControllerConfig,
  licensingModuleConfig,
  ipAccountImplConfig,
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

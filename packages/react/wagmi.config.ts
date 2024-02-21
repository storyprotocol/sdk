import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import * as dotenv from "dotenv";
import { Abi } from "abitype";
import { pascalCase } from "change-case";

import { defaultGetHookName, defaultWagmiGetHookName } from "./src/utils";
import contracts from "./contracts.json";
import { abi as registrationModuleAbi } from "../protocol-core/out/RegistrationModule.sol/RegistrationModule.json";
import { abi as disputeModuleAbi } from "../protocol-core/out/DisputeModule.sol/DisputeModule.json";
import { abi as ipAssetRegistryAbi } from "../protocol-core/out/IPAssetRegistry.sol/IPAssetRegistry.json";
import { abi as licenseRegistryAbi } from "../protocol-core/out/LicenseRegistry.sol/LicenseRegistry.json";
import { abi as licensingModuleAbi } from "../protocol-core/out/LicensingModule.sol/LicensingModule.json";
import { abi as accessControllerAbi } from "../protocol-core/out/AccessController.sol/AccessController.json";
import { abi as ipAccountImplAbi } from "../protocol-core/out/IPAccountImpl.sol/IPAccountImpl.json";
import { abi as PILPolicyFrameworkManagerAbi } from "../protocol-core/out/PILPolicyFrameworkManager.sol/PILPolicyFrameworkManager.json";

dotenv.config();

type GetHookNameProps = {
  contractName: string;
  type: string;
  itemName?: string | undefined;
};

let counter = 0;

function generateConfig(
  generatedName: string,
  contractName: string,
  abi: Abi,
  address?: `0x${string}`,
  getHookName?: ({
    contractName,
    itemName,
    type,
  }: {
    contractName: string;
    itemName: string | undefined;
    type: string;
  }) => `use${string}`,
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
        getHookName: ({ contractName, itemName, type }: GetHookNameProps) => {
          return getHookName
            ? getHookName({ contractName, itemName, type })
            : defaultGetHookName({ contractName, itemName, type });
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
  ({ contractName, itemName, type }: GetHookNameProps) => {
    return defaultWagmiGetHookName({ contractName, itemName, type });
  },
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
  contracts.LicensingModule as `0x${string}`,
  ({ contractName, itemName, type }: GetHookNameProps) => {
    if (itemName === "LicenseRegistry" || itemName === "DisputeModule") {
      counter = counter + 1;
      return (`use${pascalCase(type)}${contractName}${itemName ? itemName : ""}` +
        counter.toString()) as `use${string}`;
    }
    return defaultGetHookName({ contractName, itemName, type });
  },
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
  undefined,
  ({ contractName, itemName, type }: GetHookNameProps) => {
    if (
      itemName?.toLowerCase() === "accesscontroller" ||
      itemName?.toLowerCase() === "ipaccountregistry"
    ) {
      counter = counter + 1;
      return (`use${pascalCase(type)}${contractName}${itemName ? itemName : ""}` +
        counter.toString()) as `use${string}`;
    }
    return defaultGetHookName({ contractName, itemName, type });
  },
);

const disputeModuleConfig = generateConfig(
  "disputeModule",
  "DisputeModule",
  disputeModuleAbi as Abi,
  contracts.DisputeModule as `0x${string}`,
  ({ contractName, itemName, type }: GetHookNameProps) => {
    if (
      itemName?.toLowerCase() === "accesscontroller" ||
      itemName?.toLowerCase() === "ipaccountregistry" ||
      itemName?.toLowerCase() === "ipassetregistry" ||
      itemName?.toLowerCase() === "setgovernance"
    ) {
      counter = counter + 1;
      return (`use${pascalCase(type)}${contractName}${itemName ? itemName : ""}` +
        counter.toString()) as `use${string}`;
    }
    return defaultGetHookName({ contractName, itemName, type });
  },
);

const PILPolicyFrameworkManager = generateConfig(
  "PILPolicyFrameworkManager",
  "PILPolicyFrameworkManager",
  PILPolicyFrameworkManagerAbi as Abi,
  contracts.PILPolicyFrameworkManager as `0x${string}`,
  ({ contractName, itemName, type }: GetHookNameProps) => {
    if (itemName === "LicensingModule") {
      counter = counter + 1;
      return (`use${pascalCase(type)}${contractName}${itemName ? itemName : ""}` +
        counter.toString()) as `use${string}`;
    } else if (itemName?.toLowerCase() === "registerpolicy") {
      return `use${pascalCase(type)}${pascalCase(contractName)}${pascalCase(itemName)}`;
    }
    return defaultWagmiGetHookName({ contractName, itemName, type });
  },
);

export default defineConfig([
  ipAssetRegistryConfig,
  licenseRegistryConfig,
  registrationModuleConfig,
  accessControllerConfig,
  licensingModuleConfig,
  ipAccountImplConfig,
  disputeModuleConfig,
  PILPolicyFrameworkManager,
]);

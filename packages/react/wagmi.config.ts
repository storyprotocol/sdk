import { defineConfig } from '@wagmi/cli';
import { actions, react } from '@wagmi/cli/plugins';
import * as dotenv from 'dotenv';
import { Abi } from 'abitype';

import { abi as ipAccountRegistryAbi } from '../protocol-core/out/IIPAccountRegistry.sol/IIPAccountRegistry.json';
import { abi as registrationModuleAbi } from '../protocol-core/out/RegistrationModule.sol/RegistrationModule.json';
import { abi as disputeModuleAbi } from '../protocol-core/out/DisputeModule.sol/DisputeModule.json';
import { abi as ipAssetRegistryAbi } from '../protocol-core/out/IPAssetRegistry.sol/IPAssetRegistry.json';
import { abi as licenseRegistryAbi } from '../protocol-core/out/LicenseRegistry.sol/LicenseRegistry.json';
import { abi as moduleRegistryAbi } from '../protocol-core/out/ModuleRegistry.sol/ModuleRegistry.json';
import { abi as taggingModuleAbi } from '../protocol-core/out/TaggingModule.sol/TaggingModule.json';
import { abi as licensingModuleAbi } from '../protocol-core/out/LicensingModule.sol/LicensingModule.json';
import { abi as accessControllerAbi } from '../protocol-core/out/AccessController.sol/AccessController.json';
import { abi as ipAccountImplAbi } from '../protocol-core/out/IPAccountImpl.sol/IPAccountImpl.json';

const licenseRegistryAddress = '0x051A0441918d7c393ba796dc6754c476324dAdEC';
const licensingModuleAddress = '0x911415eb87b732443e8FbAd8aC8890Bf73BAa8Ec';
const taggingModuleAddress = '0x333BECf0FF68C02E4387005A89c30De885b8a38F';
const accessControllerAddress = '0x069AD174fb6285086b692AC9a6f328DCBcB94FC3';
const ipAccountImplAddress = '0x2d861075F6B4965F181b57D3F54bd0E5094068Aa';

const ipAssetRegistryConfig = generateConfig(
  'ipAssetRegistry',
  'IpAssetRegistry',
  '0xF2c66aAd2287F3fa00C3461862612Eaf1FAAEcDb' as `0x${string}`,
  ipAssetRegistryAbi as Abi
);
const licenseRegistryConfig = generateConfig(
  'licenseRegistry',
  'LicenseRegistry',
  licenseRegistryAddress,
  licenseRegistryAbi as Abi
);
const licensingModuleConfig = generateConfig(
  'licensingModule',
  'LicensingModule',
  licensingModuleAddress,
  licensingModuleAbi as Abi
);
const taggingModuleConfig = generateConfig(
  'taggingModule',
  'TaggingModule',
  taggingModuleAddress,
  taggingModuleAbi as Abi
);
const accessControllerConfig = generateConfig(
  'accessController',
  'AccessController',
  accessControllerAddress,
  accessControllerAbi as Abi
);

const ipAccountImplConfig = generateConfig(
  'ipAccountImpl',
  'IPAccountImpl',
  ipAccountImplAddress,
  ipAccountImplAbi as Abi
);

dotenv.config();

function generateConfig(
  generatedName: string,
  contractName: string,
  address: `0x${string}`,
  abi: Abi
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
    plugins: [react()],
  };
}

const registrationModuleConfig = generateConfig(
  'registrationModule',
  'RegistrationModule',
  process.env.NEXT_PUBLIC_REGISTRATION_MODULE as `0x${string}`,
  registrationModuleAbi as Abi
);

const ipAccountRegistryConfig = generateConfig(
  'ipAccountModule',
  'IPAccountRegistry',
  process.env.NEXT_PUBLIC_IP_ACCOUNT_REGISTRY as `0x${string}`,
  ipAccountRegistryAbi as Abi
);
const disputeModuleConfig = generateConfig(
  'disputeModule',
  'DisputeModule',
  // process.env.NEXT_PUBLIC_DISPUTE_MODULE as `0x${string}`,
  '0x68341Ae6e5225100D1900fE27EeDe118b0d2f473' as `0x${string}`,
  disputeModuleAbi as Abi
);

export default defineConfig([
  registrationModuleConfig,
  ipAccountRegistryConfig,
  disputeModuleConfig,
  ipAssetRegistryConfig,
  licenseRegistryConfig,
  // licensingModuleConfig, // has issues with duplicate name
  taggingModuleConfig,
  accessControllerConfig,
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

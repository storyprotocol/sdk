import { defineConfig } from '@wagmi/cli';
import { actions, react } from '@wagmi/cli/plugins';
import * as dotenv from 'dotenv';
import { Abi } from 'abitype';

import { abi as ipAccountRegistryAbi } from '../protocol-core/out/IIPAccountRegistry.sol/IIPAccountRegistry.json';
import { abi as registrationModuleAbi } from '../protocol-core/out/RegistrationModule.sol/RegistrationModule.json';
import { abi as disputeModuleAbi } from '../protocol-core/out/DisputeModule.sol/DisputeModule.json';
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
    plugins: [
      actions({
        overridePackageName: '@wagmi/core',
        getActionName({ itemName, type }) {
          if (!itemName) {
            return type;
          }
          return `${type}${itemName}`;
        },
      }),
      react(),
    ],
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

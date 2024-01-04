# Story Protocol SDK

Welcome to the documents for Story Protocol SDK. The SDK provides the APIs for developers to build applications with Story Protocol. By using the SDK, developers can create the resources like IP assets and perform actions to interact with the resource.

## How to use Story Protocol SDK in Your Project

### Install Story Protocol core SDK
Suppose you already have a node project or created a new node project. First, you need to install `@story-protocol/core-sdk` in your project. You can use one of the following command to install the package:

Use `npm`:
```
npm install --save @story-protocol/core-sdk viem
```

Use `pnpm`:
```
pnpm install @story-protocol/core-sdk viem
```

Use `yarn`:
```
yarn add @story-protocol/core-sdk viem
```

Besides the Story Protocol SDK package `@story-protocol/core-sdk`, we also require the package `viem` (https://www.npmjs.com/package/viem) to access the DeFi wallet accounts.

### Setup the `.env` file for your project

The second steps is to create a file named `.env` in the root directory of the project with the following environment variables:

```
NEXT_PUBLIC_API_BASE_URL=

NEXT_PUBLIC_STORY_PROTOCOL_CONTRACT=
NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT=
NEXT_PUBLIC_IP_ORG_CONTROLLER_CONTRACT=
NEXT_PUBLIC_RELATIONSHIP_MODULE_CONTRACT=
NEXT_PUBLIC_REGISTRATION_MODULE_CONTRACT=
NEXT_PUBLIC_LICENSE_REGISTRY_CONTRACT=
NEXT_PUBLIC_MODULE_REGISTRY_CONTRACT=

# RPC Endpoint for Sepolia Testnet
RPC_URL=https://rpc.ankr.com/eth_sepolia

# Private key of the wallet to interact with Story Protocol SDK
PRIVATE_KEY="<KEEP_ME_SECRET>"
```

The above `.env` defines several variables with prefix `NEXT_PUBLIC_`that will be used by Story Protocol SDK. Because the alpha version of Story Protocol SDK works with the smart contracts deployed on Sepolia testnet, we need to provide the RPC URL for the end point.

For the latest values of the smart contract addresses, please reach out the Story Protocol team or refer to [SDK Setup Guide Document](https://docs.storyprotocol.xyz/docs/setup)

### Create Story Protocol Client

Next, we need create a client to access Story Protocol by using private key or from the wallet app of browser.

Here is the way to create a Story Protocol client with the private key:

```typescript
import { privateKeyToAccount } from "viem/accounts";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x";
const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

// Instantiate the Story Client for readonly operations, using default 
export const realonlyClient = StoryClient.newReadOnlyClient({});

// Instantiate the Story Client, test environment required for alpha release.
// The private key is also required for written operations.
export const client = StoryClient.newClient({account});
```

Here is the way to create a Story Protocol with wallet app:

```typescript
import { createWalletClient, custom } from 'viem'
import { sepolia } from 'viem/chains'

const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum)
})

// Retrieve the first account for eth_requestAccounts method
const account = await walletClient.requestAddresses()[0]

// Instantiate the Story Client for readonly operations, using default 
export const realonlyClient = StoryClient.newReadOnlyClient({});

// Instantiate the Story Client, test environment required for alpha release.
// The private key is also required for written operations.
export const client = StoryClient.newClient({account});
```

### Use `Client` or `ReadOnlyClient` to access Story Protocol

Now you can use the `ReadOnlyClient` instance to perform read-only operations with Story Protocol resources, and `Client` instance to perform both read-only and write operations. `ReadOnlyClient` and `Client` are the aggregators for accessing the resources. You can refer to [SDK document](https://docs.storyprotocol.xyz/docs/overview-1) to learn how to use these clients interact with Story Protocol.

You can also refer to the [Story Protocol Example Repostory](https://github.com/storyprotocol/my-story-protocol-example/) to learn with the SDK example.

## How To Build and Test Story Protocol SDK

This section provides the instructions on how to build Story Protocol SDK from source code.

### Prerequisite

* Install PNPM: Execute `npm install -g pnpm`
* Install TypeScript: Run `pnpm add typescript -D`
* Install Yalc: Use `npm install -g yalc`

### Steps for Using Yalc for Local Testing of Core-SDK
For manual testing of the core-sdk, set up a separate web project. The guide below uses `yalc` to link the `core-sdk` locally, enabling its installation and import for testing.

Under the `typescript-sdk/packages/core-sdk` directory:
* Navigate to the `core-sdk` directory.
* Execute `npm run build` to build your latest code.
* Run `yalc publish`. You should see a message like `@story-protocol/core-sdk@<version> published in store.` (Note: The version number may vary).

To set up your testing environment (e.g., a new Next.js project), use `yalc add @story-protocol/core-sdk@<version>` (ensure the version number is updated accordingly).
* Run `pnpm install`. This installs `@story-protocol/core-sdk@<version>` with your local changes.

### Steps to Refresh the Changes
Under the `typescript-sdk/packages/core-sdk` directory:
* Execute `npm run build` to build your latest code.
* Run `yalc push`.

In your testing environment:
* Run `yalc update` to pull the latest changes.

## Steps to pull and compile latest smart contract ABIs (Currently pulls from the protocol-contracts `dev` branch)
Must have `solc` installed (https://docs.soliditylang.org/en/v0.8.9/installing-solidity.html)
* run `make compile_contracts`

## Release

| Package                         | Description                                    |
| :------------------------------ | :--------------------------------------------- |
| [core-sdk](./packages/core-sdk) | The core sdk for interacting with the protocol |

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change. Details see: [CONTRIBUTING](/CONTRIBUTING.md)

Please make sure to update tests as appropriate.

## License

[MIT License](/LICENSE.md)

## Contact Us


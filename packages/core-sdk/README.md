# Story Protocol SDK

Welcome to the documents for Story Protocol SDK. The SDK provides the APIs for developers to build applications with Story Protocol. By using the SDK, developers can create the resources like IP assets and perform actions to interact with the resource.

## How to use Story Protocol SDK in Your Project

### Install Story Protocol core SDK

Suppose you already have a node project or created a new node project. First, you need to install `@story-protocol/core-sdk` in your project. You can use one of the following command to install the package:

Use `npm`:

```
npm install --save @story-protocol/core-sdk viem@1.21.4
```

Use `pnpm`:

```
pnpm install @story-protocol/core-sdk viem@1.21.4
```

Use `yarn`:

```
yarn add @story-protocol/core-sdk viem@1.21.4
```

Besides the Story Protocol SDK package `@story-protocol/core-sdk`, we also require the package `viem` (https://www.npmjs.com/package/viem) to access the DeFi wallet accounts.

# Initiate SDK Client

Next we can initiate the SDK Client by first setting up our wallet and then the client itself.

## Set up your wallet

The SDK supports using `viem` for initiating SDK client. Create a typescript file and write the following code to initiate the client with a private key:

> :information-source: Make sure to have WALLET_PRIVATE_KEY set up in your .env file.

```typescript index.ts
import { privateKeyToAccount } from "viem/accounts";

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "0x";
const account = privateKeyToAccount(WALLET_PRIVATE_KEY as Address);
```

The preceding code created the `account` object for creating the SDK client.

## Set up SDK client

To set up the SDK client, import `StoryClient` and `StoryConfig` from `@story-protocol/core-sdk`. Write the following code, utilizing the `account` we created previously.

> :information-source: Make sure to have RPC_PROVIDER_URL for your desired chain set up in your .env file. We recommend using the Iliad network with `RPC_PROVIDER_URL=https://rpc.partner.testnet.storyprotocol.net`.

```typescript index.ts
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

const config: StoryConfig = {
  transport: http(process.env.RPC_PROVIDER_URL),
  account: account,
};
const client = StoryClient.newClient(config);
```

## How To Build and Test Story Protocol SDK for local testing

This section provides the instructions on how to build Story Protocol SDK from source code.

### Prerequisite

- Install PNPM: Execute `npm install -g pnpm`
- Install TypeScript: Run `pnpm add typescript -D`
- Install Yalc: Use `npm install -g yalc`

### Steps for Using Yalc for Local Testing of Core-SDK

For manual testing of the core-sdk, set up a separate web project. The guide below uses `yalc` to link the `core-sdk` locally, enabling its installation and import for testing.

Under the `typescript-sdk/packages/core-sdk` directory:

- Navigate to the `core-sdk` directory.
- Execute `npm run build` to build your latest code.
- Run `yalc publish`. You should see a message like `@story-protocol/core-sdk@<version> published in store.` (Note: The version number may vary).

To set up your testing environment (e.g., a new Next.js project), use `yalc add @story-protocol/core-sdk@<version>` (ensure the version number is updated accordingly).

- Run `pnpm install`. This installs `@story-protocol/core-sdk@<version>` with your local changes.

### Steps to Refresh the Changes

Under the `typescript-sdk/packages/core-sdk` directory:

- Execute `npm run build` to build your latest code.
- Run `yalc push`.

In your testing environment:

- Run `yalc update` to pull the latest changes.

## Steps to pull and compile latest Protocol Core & Periphery v1 Smart Contract ABIs (Currently pulls from the protocol-core-v1 and protocol-periphery-v1 `release-v1.x.x` branch)

- run `cd packages/wagmi-generator && npm run generate`

## Release

| Package                           | Description                                     |
| :-------------------------------- | :---------------------------------------------- |
| [core-sdk](./packages/core-sdk)   | The core sdk for interacting with the protocol  |
| [react-sdk](./packages/react-sdk) | The react sdk for interacting with the protocol |

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change. Details see: [CONTRIBUTING](/CONTRIBUTING.md)

Please make sure to update tests as appropriate.

## License

[MIT License](/LICENSE.md)

## Contact Us

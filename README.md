# Story Protocol SDK [![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/storyprotocol/sdk/blob/main/LICENSE.md)[![npm version](https://img.shields.io/npm/v/@story-protocol/core-sdk)](https://www.npmjs.com/package/@story-protocol/core-sdk)[![npm downloads](https://img.shields.io/npm/dm/@story-protocol/core-sdk)](https://www.npmjs.com/package/@story-protocol/core-sdk)

Welcome to the Story Protocol SDK - a comprehensive toolkit for building applications on Story Protocol. This SDK empowers developers to seamlessly interact with intellectual property (IP) assets on the blockchain through an intuitive API interface.

Key Features:

- IP Asset Module: Register, and manage intellectual property assets on-chain
- License Module: Create customizable license terms, attach them to IP assets, and mint transferable license tokens
- Royalty Module: Claim royalties, and manage payment distributions
- Dispute Module: Initiate, manage and resolve IP-related disputes through on-chain governance
- Group Module: Create IP collections with shared revenue pools
- WIP Module: Wrap native IP into ERC-20 tokens for DeFi integrations
- NFT Client Module: Mint a new SPG collection for use with Story Protocol.

The SDK provides robust support for the following networks:

- [aeneid](https://docs.story.foundation/network/network-info/aeneid) - A dedicated testnet environment for development and testing
- [mainnet](https://docs.story.foundation/network/network-info/mainnet) - The production network for live deployments

# Documentation

For more detailed information on using the SDK, refer to the [TypeScript SDK Guide](https://docs.story.foundation/developers/typescript-sdk/overview).

The documentation is divided into the following sections:

Use `yarn`:

```
yarn add @story-protocol/core-sdk viem@1.21.4
```

Besides the Story Protocol SDK package `@story-protocol/core-sdk`, we also require the package `viem` (https://www.npmjs.com/package/viem) to access the DeFi wallet accounts.

## Initiate SDK Client

Next we can initiate the SDK Client by first setting up our wallet and then the client itself.

### Set up your wallet

The SDK supports using `viem` for initiating SDK client. Create a typescript file and write the following code to initiate the client with a private key:

> :information-source: Make sure to have WALLET_PRIVATE_KEY set up in your .env file.

```typescript index.ts
import { privateKeyToAccount } from "viem/accounts";

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "0x";
const account = privateKeyToAccount(WALLET_PRIVATE_KEY as Address);
```

The preceding code created the `account` object for creating the SDK client.

### Set up SDK client

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

| Package                         | Description                                     |
| :------------------------------ | :---------------------------------------------- |
| [core-sdk](./packages/core-sdk) | The core sdk for interacting with the protocol  |

- [Overview](https://docs.story.foundation/developers/typescript-sdk/overview)
- [Setup](https://docs.story.foundation/developers/typescript-sdk/setup)
- [Register an IP Asset](https://docs.story.foundation/developers/typescript-sdk/register-ip-asset)
- [Attach Terms to an IPA](https://docs.story.foundation/developers/typescript-sdk/attach-terms)
- [Mint a License Token](https://docs.story.foundation/developers/typescript-sdk/mint-license)
- [Register a Derivative](https://docs.story.foundation/developers/typescript-sdk/register-derivative)
- [Pay an IPA](https://docs.story.foundation/developers/typescript-sdk/pay-ipa)
- [Claim Revenue](https://docs.story.foundation/developers/typescript-sdk/claim-revenue)
- [Raise a Dispute](https://docs.story.foundation/developers/typescript-sdk/raise-dispute)

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change. Details see: [CONTRIBUTING](/CONTRIBUTING.md)

Please make sure to update tests as appropriate.

## License

[MIT License](/LICENSE.md)
[Copyright (c) 2023-Present Story Protocol Inc.](/LICENSE.md)


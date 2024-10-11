# Story Protocol React SDK

The react-sdk is a library that provides a set of hooks to interact with the SDK. It is designed to be used in a React application.

## How to use Story Protocol SDK in Your Project

### Generate React SDK

1. Install the dependencies

```bash
pnpm install
```

2. Update the `@story-protocol/core-sdk` package version in the `packages/react-sdk/package.json` file to the latest version.

Important: Once publish core-sdk, you need to update the core-sdk version in the react-sdk package.json file.

3. Generate the SDK

```bash
pnpm run generate
```

This SDK is generated using the command `pnpm run generate`. The source code resides in the `packages/sdk` directory and the generated SDK can be found in the `packages/react-sdk` folder.

### How to use Story Protocol React SDK in Your Project

- Install Story Protocol React SDK

```bash
pnpm install @story-protocol/react-sdk
```

- Import the provider in your React application

```typescript
import { StoryProvider } from "@story-protocol/react-sdk";
const client = StoryClient.newClient(config);
 <StoryProvider
  config={{
    transport: http("RPC_URL"),
    wallet: walletClient,
  }}
  </StoryProvider>
```

- Use the hooks in your component

```typescript
import { useIpAsset } from "@story-protocol/react-sdk";
const { data, error, loading, register } = useIpAsset();
register({ nftContract: "0x1234", tokenId: "1" });
```

### How To Build and Test Story Protocol React SDK for local testing

- Install yalc

```bash
npm install -g yalc
```

- For manual testing of the react-sdk, set up a separate web project. The guide below uses `yalc` to link the `react-sdk` locally, enabling its installation and import for testing.

Under the `typescript-sdk/packages/react-sdk` directory:

- Execute `npm run build` to build your latest code.
- Run `yalc publish`. You should see a message like `@story-protocol/react-sdk@<version> published in store.` (Note: The version number may vary).
- To set up your testing environment (e.g., a new Next.js project), use `yalc add @story-protocol/react-sdk@<version>` (ensure the version number is updated accordingly).

- Run `pnpm install`. This installs `@story-protocol/react-sdk@<version>` with your local changes.

### Steps to Refresh the Changes

Under the `typescript-sdk/packages/react-sdk` directory:

- Execute `npm run build` to build your latest code.
- Run `yalc push`.

In your testing environment:

- Run `yalc update` to pull the latest changes.

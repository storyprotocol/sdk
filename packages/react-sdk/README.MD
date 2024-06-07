# Story Protocol React SDK

The react-sdk is a library that provides a set of hooks to interact with the SDK. It is designed to be used in a React application.

## How to use Story Protocol SDK in Your Project

### Generate React SDK

1. Install the dependencies

```bash
pnpm install
```

2. Update the `@story-protocol/core-sdk` package version in the `packages/react-sdk/package.json` file to the latest version.

3. Generate the SDK

```bash
pnpm run generate
```

This SDK is generated using the command `pnpm run generate`. The source code resides in the `packages/sdk` directory and the generated SDK can be found in the `packages/react-sdk` folder.

### How to use Story Protocol React SDK in Your Project

- Install Story Protocol React SDK

```bash
pnpm install
```

- Import the provider in your React application

```typescript
import { StoryProvider } from "@story-protocol/react-sdk";
const client = StoryClient.newClient(config);
<StoryProvider client={client}>
  <App />
</StoryProvider>;
```

- Use the hooks in your components

```typescript
import { useIpAsset } from "@story-protocol/react-sdk";
const { data, error, loading, register } = useIpAsset();
register({ nftContract: "0x1234", tokenId: "1" });
```

core-sdk is the base level sdk to interact with story protocol. It provides functions to both read and write data to the protocol.

## Installation

Install the SDK and ethers.js

npm

```shell
npm i @story-protocol/core-sdk ethers@^5.7.2
```

pnpm

```shell
pnpm i @story-protocol/core-sdk ethers@^5.7.2
```

yarn

```shell
yarn add @story-protocol/core-sdk ethers@^5.7.2
```

## Set up `.env` file

(Ask the team to provide the values)

```
NEXT_PUBLIC_API_BASE_URL =
NEXT_PUBLIC_FRANCHISE_REGISTRY_CONTRACT =
NEXT_PUBLIC_RELATIONSHIP_MODULE_CONTRACT =
NEXT_PUBLIC_COLLECT_MODULE_CONTRACT =
NEXT_PUBLIC_LICENSING_MODULE_CONTRACT =
```

## Set up SDK client

Using browser wallet

```typescript
import { StoryClient } from "@story-protocol/core-sdk";
import ethers from "ethers";

// Provider/Signer from browser wallet (i.e Metamask)
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = await provider.getSigner();

// Instantiate a read-only Story Client with an optional provider
const client = StoryClient.newReadOnlyClient({ provider });

// Instatiate a read/write Story Client with a signer
const client = StoryClient.newClient({ signer });
```

Using private key

```typescript
import { StoryClient } from "@story-protocol/core-sdk"
import ethers from "ethers"

// Signer from private key
const provider = new ethers.providers.JsonRpcProvider(<YOUR RPC URL>)
const signer = new ethers.Wallet(<YOUR PRIVATE KEY>, provider)

// Instantiate the Story Client
const client = StoryClient.newClient({ signer })

```

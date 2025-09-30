# Upgrade Overview

Version `v1.4.0` of the Story Protocol SDK has been released：

- A **major redesign of IP asset registration and derivative workflows**
- New **module capabilities and utility methods**
- **Stricter type safety** and default values
- Simplified **transaction handling**
- **Improved developer ergonomics** with more consistent methods
- Expanded **test coverage and validation**

This guide summarizes all **breaking changes**, **new features**, **validation improvements**, and **deprecated methods that** developers must be aware of when upgrading from `v1.3.x`.

# Breaking Changes

**1. `registerPilTermsAndAttach`** moved to License module ([#636](https://github.com/storyprotocol/sdk/pull/636))

Before (1.3.x):

```tsx
 await client.ipAsset.registerPilTermsAndAttach({
	 ipId,
	 licenseTermsData
 })
```

After (v1.4.0):

```tsx
await client.license.registerPilTermsAndAttach({
	 ipId,
	 licenseTermsData
 })
```

1. Numeric fields now strictly `number | bigint` ****([#635](https://github.com/storyprotocol/sdk/pull/635)) 

Before (1.3.x):

```tsx
await clientA.dispute.raiseDispute({
  targetIpId,
  cid,
  targetTag,
  liveness: "2592000",
  bond,
});
```

After (v1.4.0):

```tsx
await clientA.dispute.raiseDispute({
  targetIpId,
  cid,
  targetTag,
  liveness: 2592000,
  bond,
});
```

1. Unified return type for derivative registration([#633](https://github.com/storyprotocol/sdk/pull/633))

`registerDerivative` and `registerDerivativeWithLicenseTokens` now return **`LinkDerivativeResponse`** (aligned with `linkDerivative`).

Before (1.3.x):

```tsx
const response: RegisterDerivativeResponse =
  await client.ipAsset.registerDerivative({
    childIpId: childIpId,
    parentIpIds: [parentIpId],
    licenseTermsIds: [noCommercialLicenseTermsId],
  });
const txHash = response.txHash;

const response: RegisterDerivativeWithLicenseTokensResponse =
  await client.ipAsset.registerDerivativeWithLicenseTokens({
    childIpId,
    licenseTokenIds,
  });
const txHash = response.txHash;
```

After (v1.4.0):

```tsx
// New return type with better type safety
const response: LinkDerivativeResponse =
  await client.ipAsset.registerDerivative({
    childIpId: childIpId,
    parentIpIds: [parentIpId],
    licenseTermsIds: [noCommercialLicenseTermsId],
  });
// Accessing properties (same field names, different type)
txHash = response.txHash;

const response: LinkDerivativeResponse =
  await client.ipAsset.registerDerivativeWithLicenseTokens({
    childIpId,
    licenseTokenIds,
  });
const txHash = response.txHash;
```

4.  Response field renamed in IP Asset ([#572](https://github.com/storyprotocol/sdk/pull/572))

Introduced in **v1.3.3**, required for v1.4.0

`ipIdAndTokenId` → `ipAssetsWithLicenseTerms`

Before (1.3.x):

```tsx
const response =
  await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows({
    requests: requests,
  });
const ipInfo = response.ipIdAndTokenId;
```

After (v1.4.0):

```tsx
const result = await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows(
  {
    requests: requests,
  }
);
// Accessing: result.ipAssetsWithLicenseTerms
```

5.  Enum for dispute target tag([#521](https://github.com/storyprotocol/sdk/pull/521)) 

Introduced in **v1.3.2**, required for v1.4.0

Before (1.3.x):

```tsx
await clientA.dispute.raiseDispute({
  targetIpId,
  cid,
  targetTag: "IMPROPER_REGISTRATION",
  liveness,
  bond,
});
```

After (v1.4.0):

```tsx
await clientA.dispute.raiseDispute({
  targetIpId,
  cid,
  targetTag: DisputeTargetTag.IMPROPER_REGISTRATION,
  liveness,
  bond,
});
```

6. Renamed property in Royalty module([#523](https://github.com/storyprotocol/sdk/pull/523))

Introduced in **v1.3.2**, required for v1.4.0

`royaltyVaultIpId` → `ipId`

Before (1.3.x):

```tsx
await client.royalty.claimableRevenue({
  royaltyVaultIpId: parentIpId,
  claimer,
  token,
});
```

After (v1.4.0):

```tsx
await client.royalty.claimableRevenue({
  ipId: parentIpId,
  claimer,
  token,
});
```

7. chainId type changed to number ([#527](https://github.com/storyprotocol/sdk/pull/527))

Introduced in **v1.3.2**, required for v1.4.0

Before(**1.3.x** ):

```tsx
const config: StoryConfig = {
  chainId: "1315",
  transport: http(RPC),
  account: privateKeyToAccount(privateKey),
};

const storyClient = StoryClient.newClient(config);
```

After (v1.4.0):

```tsx
const config: StoryConfig = {
  chainId: 1315,
  transport: http(RPC),
  account: privateKeyToAccount(privateKey),
};

const storyClient = StoryClient.newClient(config); 
```

8. `txHash` field type changed([#545](https://github.com/storyprotocol/sdk/pull/545))

Introduced in **v1.3.2**, required for v1.4.0

9. Unified options parameter([#547](https://github.com/storyprotocol/sdk/pull/547))

Introduced in **v1.3.2**, required for v1.4.0

Multiple optional arguments (e.g., `wipOptions`, `erc20Options`) consolidated into a single `options` object.

Before(**1.3.x** ):

```tsx
await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows({
  requests: requests,
  wipOptions: {
    useMulticallWhenPossible: false,
  },
});
```

After (v1.3.2):

```tsx
await client.ipAsset.batchRegisterIpAssetsWithOptimizedWorkflows({
  requests: requests,
  options: {
    wipOptions: {
      useMulticallWhenPossible: false,
    },
  },
});
```

# **New Features**

**1. IP Asset Module**

- `batchRegisterIpAssetsWithOptimizedWorkflows` ([#505](https://github.com/storyprotocol/sdk/pull/505))
- `batchMintAndRegisterIp` ([#615](https://github.com/storyprotocol/sdk/pull/615) )
- Redesigned workflows with three core methods([#628](https://github.com/storyprotocol/sdk/pull/628),[#629](https://github.com/storyprotocol/sdk/pull/629),[#630](https://github.com/storyprotocol/sdk/pull/630),[#633](https://github.com/storyprotocol/sdk/pull/633)):
    - `registerIpAsset`
    - `registerDerivativeIpAsset`
    - `linkDerivative`
1. **License Module**
    - New methods: `getLicensingConfig`,`registerCreativeCommonsAttributionPIL` ,`setMaxLicenseTokens` ([#500](https://github.com/storyprotocol/sdk/pull/500),[#515](https://github.com/storyprotocol/sdk/pull/515),[#572](https://github.com/storyprotocol/sdk/pull/572))
    - New `PILFlavor` class for common license terms (`nonCommercialSocialRemixing`, `commercialUse`, `commercialRemix`, `creativeCommonsAttribution`)([#605](https://github.com/storyprotocol/sdk/pull/605) )
2. **Group Module**
    - New methods: `addIpsToGroup`, `removeIpsFromGroup`, `claimReward`, `getClaimableReward`, `collectingRoyalties` ([#504](https://github.com/storyprotocol/sdk/pull/504) ,[#511](https://github.com/storyprotocol/sdk/pull/511) ,[#512](https://github.com/storyprotocol/sdk/pull/512), [#513](https://github.com/storyprotocol/sdk/pull/513), [#514](https://github.com/storyprotocol/sdk/pull/514))
3. **NFT Client**
    - `setTokenURI` ,**`getTokenURI`**([#507](https://github.com/storyprotocol/sdk/pull/507) )
4. **License Token Limits**
    - Support for total license token limits via `maxLicenseTokens` in `LicenseTermsDataInput` ([#572](https://github.com/storyprotocol/sdk/pull/572) ).
5. **Transaction Handling**([#548](https://github.com/storyprotocol/sdk/pull/548))
    - All transactions are now automatically awaited.
    - `waitForTransaction` is **removed**.


## Deprecated Methods

The following features are **deprecated** and will be removed in a future release ([#605](https://github.com/storyprotocol/sdk/pull/605)).

Use **`PILFlavor`** for license creation instead:

- `LicenseClient.registerNonComSocialRemixingPIL`
- `LicenseClient.registerCommercialUsePIL`
- `LicenseClient.registerCommercialRemixPIL`
- `LicenseClient.registerCreativeCommonsAttributionPIL`
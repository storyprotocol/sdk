## :factory: IPAssetClient

### Methods

- [registerRootIp](#gear-registerrootip)
- [registerDerivativeIp](#gear-registerderivativeip)

#### :gear: registerRootIp

Registers a root-level IP into the protocol. Root-level IPs can be thought of as organizational hubs
for encapsulating policies that actual IPs can use to register through. As such, a root-level IP is not an
actual IP, but a container for IP policy management for their child IP assets.

| Method           | Type                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| `registerRootIp` | `(request: RegisterRootIpRequest) => Promise<RegisterRootIpResponse>` |

Parameters:

- `request`: The request object that contains all data needed to register a root IP.
- `request.policyId`: The policy that identifies the licensing terms of the IP.
- `request.tokenContract`: The address of the NFT bound to the root-level IP.
- `request.tokenId`: The token id of the NFT bound to the root-level IP.
- `request.ipName`: [Optional] The name assigned to the new IP.
- `request.contentHash`: [Optional] The content hash of the IP being registered.
- `request.uri`: [Optional] An external URI to link to the IP.
- `request.txOptions`: [Optional] The transaction options.

#### :gear: registerDerivativeIp

Registers derivative IPs into the protocol. Derivative IPs are IP assets that inherit policies from
parent IPs by burning acquired license NFTs.

| Method                 | Type                                                                              |
| ---------------------- | --------------------------------------------------------------------------------- |
| `registerDerivativeIp` | `(request: RegisterDerivativeIpRequest) => Promise<RegisterDerivativeIpResponse>` |

Parameters:

- `request`: The request object that contains all data needed to register a root IP.
- `request.licenseIds`: The policy that identifies the licensing terms of the IP.
- `request.tokenContract`: The address of the NFT bound to the derivative IP.
- `request.tokenId`: The token id of the NFT bound to the derivative IP.
- `request.ipName`: [Optional] The name assigned to the new IP.
- `request.contentHash`: [Optional] The content hash of the IP being registered.
- `request.uri`: [Optional] An external URI to link to the IP.
- `request.minRoyalty`: [Optional] The minimum royalty percentage that the IP owner will receive.
- `request.txOptions`: [Optional] The transaction options.

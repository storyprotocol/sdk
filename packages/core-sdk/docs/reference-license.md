## :factory: LicenseClient

### Methods

- [mintLicense](#gear-mintlicense)
- [linkIpToParent](#gear-linkiptoparent)

#### :gear: mintLicense

Mints license NFTs representing a policy granted by a set of ipIds (licensors). This NFT needs to be
burned in order to link a derivative IP with its parents. If this is the first combination of policy and
licensors, a new licenseId will be created. If not, the license is fungible and an id will be reused.

| Method        | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| `mintLicense` | `(request: MintLicenseRequest) => Promise<MintLicenseResponse>` |

Parameters:

- `request`: The request object containing necessary data to mint a license.
- `request.policyId`: The ID of the policy to be minted
- `request.licensorIpId_`: The ID of the IP granting the license (ie. licensor)
- `request.mintAmount`: Number of licenses to mint. License NFT is fungible for same policy and same licensors
- `request.receiver`: Receiver address of the minted license NFT(s).

#### :gear: linkIpToParent

| Method           | Type                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| `linkIpToParent` | `(request: LinkIpToParentRequest) => Promise<LinkIpToParentResponse>` |

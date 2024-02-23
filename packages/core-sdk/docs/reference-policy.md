## :factory: PolicyClient

### Methods

- [registerPILPolicy](#gear-registerpilpolicy)
- [addPolicyToIp](#gear-addpolicytoip)

#### :gear: registerPILPolicy

Registers a PIL policy to the registry
Internally, this function must generate a Licensing.Policy struct and call registerPolicy.

| Method              | Type                                                                        |
| ------------------- | --------------------------------------------------------------------------- |
| `registerPILPolicy` | `(request: RegisterPILPolicyRequest) => Promise<RegisterPILPolicyResponse>` |

Parameters:

- `request`: - the licensing parameters for the Programmable IP License v1 (PIL) standard.
- `request.transferable`: Whether or not the license is transferable
- `request.attribution`: Whether or not attribution is required when reproducing the work
- `request.commercialUse`: Whether or not the work can be used commercially
- `request.commercialAttribution`: Whether or not attribution is required when reproducing the work commercially
- `request.commercializerChecker`: commericializers that are allowed to commercially exploit the work. If zero address, then no restrictions is enforced.
- `request.commercialRevShare`: Percentage of revenue that must be shared with the licensor
- `request.derivativesAllowed`: Whether or not the licensee can create derivatives of his work
- `request.derivativesAttribution`: Whether or not attribution is required for derivatives of the work
- `request.derivativesApproval`: Whether or not the licensor must approve derivatives of the work before they can be linked to the licensor IP ID
- `request.derivativesReciprocal`: Whether or not the licensee must license derivatives of the work under the same terms.
- `request.territories`: List of territories where the license is valid. If empty, global.
- `request.distributionChannels`: List of distribution channels where the license is valid. Empty if no restrictions.
- `request.royaltyPolicy`: Address of a royalty policy contract (e.g. RoyaltyPolicyLS) that will handle royalty payments

#### :gear: addPolicyToIp

Adds a policy to the set of policies of an IP

| Method          | Type                                                                |
| --------------- | ------------------------------------------------------------------- |
| `addPolicyToIp` | `(request: AddPolicyToIpRequest) => Promise<AddPolicyToIpResponse>` |

Parameters:

- `request`: The request object containing details to add a policy to an IP
- `request.ipId`: The id of the IP
- `request.polId`: The id of the policy

## :factory: PermissionClient

### Methods

- [setPermission](#gear-setpermission)

#### :gear: setPermission

Sets the permission for a specific function call
Each policy is represented as a mapping from an IP account address to a signer address to a recipient
address to a function selector to a permission level. The permission level can be 0 (ABSTAIN), 1 (ALLOW), or
2 (DENY).
By default, all policies are set to 0 (ABSTAIN), which means that the permission is not set.
The owner of ipAccount by default has all permission.
address(0) => wildcard
bytes4(0) => wildcard
Specific permission overrides wildcard permission.

| Method          | Type                                                                  |
| --------------- | --------------------------------------------------------------------- |
| `setPermission` | `(request: setPermissionsRequest) => Promise<setPermissionsResponse>` |

Parameters:

- `request`: The request object containing necessary data to set permissions.
- `request.ipAsset`: The address of the IP account that grants the permission for `signer`
- `request.signer`: The address that can call `to` on behalf of the `ipAccount`
- `request.to`: The address that can be called by the `signer` (currently only modules can be `to`)
- `request.func`: The function selector string of `to` that can be called by the `signer` on behalf of the `ipAccount`
- `request.permission`: The new permission level

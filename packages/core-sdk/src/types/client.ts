import { TaggingClient } from "../resources/tagging";
import { ModuleReadOnlyClient } from "../resources/moduleReadOnly";
import { IPAssetClient } from "../resources/ipAsset";
import { IPAssetReadOnlyClient } from "../resources/ipAssetReadOnly";
import { PermissionClient } from "../resources/permission";
import { PermissionReadOnlyClient } from "../resources/permissionReadOnly";
import { TransactionClient } from "../resources/transaction";
import { TransactionReadOnlyClient } from "../resources/transactionReadOnly";
import { PlatformClient } from "../utils/platform";
import { LicenseClient } from "../resources/license";
import { LicenseReadOnlyClient } from "../resources/licenseReadOnly";
import { PolicyClient } from "../resources/policy";
import { PolicyReadOnlyClient } from "../resources/policyReadOnly";
import { TaggingReadOnlyClient } from "../resources/taggingReadOnly";

export interface ReadOnlyClient {
  ipAsset: IPAssetReadOnlyClient;
  permission: PermissionReadOnlyClient;
  license: LicenseReadOnlyClient;
  policy: PolicyReadOnlyClient;
  transaction: TransactionReadOnlyClient;
  tagging: TaggingReadOnlyClient;
  module: ModuleReadOnlyClient;
}

export interface Client {
  ipAsset: IPAssetClient;
  permission: PermissionClient;
  license: LicenseClient;
  policy: PolicyClient;
  transaction: TransactionClient;
  platform: PlatformClient;
  tagging: TaggingClient;
}

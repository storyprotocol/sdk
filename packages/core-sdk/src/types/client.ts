import { TaggingClient } from "../resources/tagging";
import { ModuleReadOnlyClient } from "../resources/moduleReadOnly";
import { IPAssetClient } from "../resources/ipAsset";
import { IPAssetReadOnlyClient } from "../resources/ipAssetReadOnly";
import { PermissionClient } from "../resources/permission";
import { PermissionReadOnlyClient } from "../resources/permissionReadOnly";
import { TransactionClient } from "../resources/transaction";
import { TransactionReadOnlyClient } from "../resources/transactionReadOnly";
import { PlatformClient } from "../utils/platform";

export interface ReadOnlyClient {
  ipAsset: IPAssetReadOnlyClient;
  permission: PermissionReadOnlyClient;
  transaction: TransactionReadOnlyClient;
  module: ModuleReadOnlyClient;
}

export interface Client {
  ipAsset: IPAssetClient;
  permission: PermissionClient;
  transaction: TransactionClient;
  platform: PlatformClient;
  tagging: TaggingClient;
}

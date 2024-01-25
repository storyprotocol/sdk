import { TaggingClient } from "../resources/tagging";
import { ModuleReadOnlyClient } from "../resources/moduleReadOnly";
import { IPAssetClient } from "../resources/ipAsset";
import { PermissionClient } from "../resources/permission";
import { TransactionClient } from "../resources/transaction";
import { TransactionReadOnlyClient } from "../resources/transactionReadOnly";
import { PlatformClient } from "../utils/platform";

export interface ReadOnlyClient {
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

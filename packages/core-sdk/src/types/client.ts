import { TaggingClient } from "../resources/tagging";
import { IPAssetClient } from "../resources/ipAsset";
import { PermissionClient } from "../resources/permission";
import { PlatformClient } from "../utils/platform";
import { DisputeClient } from "../resources/dispute";

export interface Client {
  ipAsset: IPAssetClient;
  permission: PermissionClient;
  platform: PlatformClient;
  tagging: TaggingClient;
  dispute: DisputeClient;
}

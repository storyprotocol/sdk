import { LicenseReadOnlyClient } from "../resources/licenseReadOnly";
import { TransactionClient } from "../resources/transaction";
import { TransactionReadOnlyClient } from "../resources/transactionReadOnly";
import { IPAssetClient } from "../resources/ipAsset";
import { IPAssetReadOnlyClient } from "../resources/ipAssetReadOnly";
import { RelationshipReadOnlyClient } from "../resources/relationshipReadOnly";
import { IPOrgReadOnlyClient } from "../resources/ipOrgReadOnly";
import { IPOrgClient } from "../resources/ipOrg";
import { ModuleReadOnlyClient } from "../resources/moduleReadOnly";
import { ModuleClient } from "../resources/module";
import { HookReadOnlyClient } from "../resources/hookReadOnly";
import { HookClient } from "../resources/hook";
import { PlatformClient } from "../utils/platform";
import { LicenseClient } from "../resources/license";
import { RelationshipClient } from "../resources/relationship";
import { RelationshipTypeClient } from "../resources/relationshipType";
import { RelationshipTypeReadOnlyClient } from "../resources/relationshipTypeReadOnly";

export interface ReadOnlyClient {
  hook: HookReadOnlyClient;
  module: ModuleReadOnlyClient;
  ipOrg: IPOrgReadOnlyClient;
  license: LicenseReadOnlyClient;
  transaction: TransactionReadOnlyClient;
  ipAsset: IPAssetReadOnlyClient;
  relationship: RelationshipReadOnlyClient;
  relationshipType: RelationshipTypeReadOnlyClient;
}

export interface Client {
  hook: HookClient;
  module: ModuleClient;
  ipOrg: IPOrgClient;
  license: LicenseClient;
  transaction: TransactionClient;
  ipAsset: IPAssetClient;
  relationship: RelationshipClient;
  relationshipType: RelationshipTypeClient;
  platform: PlatformClient;
}

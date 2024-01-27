import { IPAccountClient } from "../resources/ipAccount";
import { ModuleReadOnlyClient } from "../resources/moduleReadOnly";
import { TransactionClient } from "../resources/transaction";
import { TransactionReadOnlyClient } from "../resources/transactionReadOnly";
import { PlatformClient } from "../utils/platform";

export interface ReadOnlyClient {
  transaction: TransactionReadOnlyClient;
  module: ModuleReadOnlyClient;
}

export interface Client {
  ipAccount: IPAccountClient;
  transaction: TransactionClient;
  platform: PlatformClient;
}

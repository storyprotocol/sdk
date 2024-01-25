import { IPAccountClient } from "../resources/ipAccount";
import { TransactionClient } from "../resources/transaction";
import { TransactionReadOnlyClient } from "../resources/transactionReadOnly";
import { PlatformClient } from "../utils/platform";

export interface ReadOnlyClient {
  transaction: TransactionReadOnlyClient;
}

export interface Client {
  ipAccount: IPAccountClient;
  transaction: TransactionClient;
  platform: PlatformClient;
}

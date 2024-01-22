import { TransactionClient } from "../resources/transaction";
import { TransactionReadOnlyClient } from "../resources/transactionReadOnly";

export interface ReadOnlyClient {
  transaction: TransactionReadOnlyClient;
}

export interface Client {
  transaction: TransactionClient;
}

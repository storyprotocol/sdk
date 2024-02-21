## :factory: DisputeClient

### Methods

- [raiseDispute](#gear-raisedispute)
- [cancelDispute](#gear-canceldispute)
- [resolveDispute](#gear-resolvedispute)

#### :gear: raiseDispute

Raises a dispute on a given ipId

| Method         | Type                                                              |
| -------------- | ----------------------------------------------------------------- |
| `raiseDispute` | `(request: RaiseDisputeRequest) => Promise<RaiseDisputeResponse>` |

Parameters:

- `request`: - The request object containing necessary data to raise a dispute.
- `request.targetIpId`: - The IP ID that is the target of the dispute.
- `request.arbitrationPolicy`: - The address of the arbitration policy.
- `request.linkToDisputeEvidence`: - The link to the dispute evidence.
- `request.targetTag`: - The target tag of the dispute.
- `request.calldata`: - Optional calldata to initialize the policy.
- `request.txOptions`: - Optional transaction options.

#### :gear: cancelDispute

Cancels an ongoing dispute

| Method          | Type                                                                |
| --------------- | ------------------------------------------------------------------- |
| `cancelDispute` | `(request: CancelDisputeRequest) => Promise<CancelDisputeResponse>` |

Parameters:

- `request`: The request object containing details to cancel the dispute.
- `request.disputeId`: The ID of the dispute to be cancelled.
- `request.calldata`: Optional additional data used in the cancellation process.

#### :gear: resolveDispute

Resolves a dispute after it has been judged

| Method           | Type                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| `resolveDispute` | `(request: ResolveDisputeRequest) => Promise<ResolveDisputeResponse>` |

Parameters:

- `request`: The request object containing details to resolve the dispute.
- `request.disputeId`: The ID of the dispute to be resolved.

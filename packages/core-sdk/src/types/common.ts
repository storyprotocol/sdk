export type Hex = `0x${string}`;

export type TypedData = {
  interface: string; // i.e. "(address,uint256)"
  data: unknown[];
};

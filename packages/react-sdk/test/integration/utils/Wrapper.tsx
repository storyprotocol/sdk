import { Address, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ReactNode } from "react";

import { StoryProvider } from "../../../src";

type Props = { children: ReactNode };
const Wrapper = ({ children }: Props) => (
  <StoryProvider
    config={{
      transport: http("https://testnet.storyrpc.io"),
      account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY! as Address),
    }}
  >
    {children}
  </StoryProvider>
);
export default Wrapper;

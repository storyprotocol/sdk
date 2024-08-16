import { Address, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ReactNode } from "react";

import { StoryProvider } from "../../../src";

type Props = { children: ReactNode };
const Wrapper = ({ children }: Props) => (
  <StoryProvider
    config={{
      transport: http("http://localhost:8545"),
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      account: privateKeyToAccount(process.env.WALLET_PRIVATE_KEY! as Address),
    }}
  >
    {children}
  </StoryProvider>
);
export default Wrapper;

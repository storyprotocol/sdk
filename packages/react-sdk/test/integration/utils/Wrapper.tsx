import { Address, http } from "viem";
import { StoryProvider } from "../../../src";
import "dotenv/config";
import { privateKeyToAccount } from "viem/accounts";
import { ReactNode } from "react";
type Props = { children: ReactNode };
const Wrapper = ({ children }: Props) => (
  <StoryProvider
    config={{
      transport: http("http://localhost:8545"),
      account: privateKeyToAccount(
        process.env.SEPOLIA_WALLET_PRIVATE_KEY as Address
      ),
    }}
  >
    {children}
  </StoryProvider>
);
export default Wrapper;

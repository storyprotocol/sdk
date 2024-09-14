import { createContext, useContext, ReactNode, useMemo } from "react";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

type Props = {
  config: StoryConfig;
  children: ReactNode;
};

const StoryContext = createContext<StoryClient>({} as StoryClient);

const StoryProvider = ({ config, children }: Props) => {
  const client = useMemo(() => StoryClient.newClient(config), [config]);
  return (
    <StoryContext.Provider value={client}>{children}</StoryContext.Provider>
  );
};
const useStoryContext = (): StoryClient => {
  return useContext(StoryContext);
};
export { useStoryContext, StoryProvider };

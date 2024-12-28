import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

type Props = {
  config: StoryConfig;
  children: ReactNode;
};

const StoryContext = createContext<StoryClient>({} as StoryClient);

const StoryProvider = ({ config, children }: Props) => {
  const [client, setClient] = useState<StoryClient | undefined>(undefined);

  useEffect(() => {
    setClient(StoryClient.newClient(config));
  }, [config]);

  if (!client) {
    return <div>Loading...</div>; // Loading state while the client is being created
  }

  return (
    <StoryContext.Provider value={client}>{children}</StoryContext.Provider>
  );
};

const useStoryContext = (): StoryClient => {
  return useContext(StoryContext);
};

export { useStoryContext, StoryProvider };

import {createContext, useContext, ReactNode} from "react";
import {StoryClient} from "@story-protocol/core-sdk";

type Props = {
    client: StoryClient;
    children: ReactNode;
};

const StoryContext = createContext<StoryClient>({} as StoryClient);

const StoryProvider = ({client,children}:Props) => {
return (
    <StoryContext.Provider value={client}>
    {children}
    </StoryContext.Provider>
);
};
const useStoryContext = ():StoryClient => {
    const context = useContext(StoryContext);
    return context;
}
export {useStoryContext, StoryProvider}
